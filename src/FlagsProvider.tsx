import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import type { Context, DefaultsCollection, FlagManager, Zenmanage } from '@zenmanage/sdk';
import { FlagsContext } from './context';
import { createReactNativeClient } from './createClient';
import type { AppStateLike, FlagsProviderProps, IdentifyOptions } from './types';

interface ProviderState {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  revision: number;
}

function getDefaultAppState(): AppStateLike | undefined {
  try {
    // Dynamic require keeps the package test-friendly and avoids hard crashes outside RN runtimes.
    const loader = new Function('return typeof require !== "undefined" ? require : null')() as
      | ((id: string) => unknown)
      | null;

    if (!loader) {
      return undefined;
    }

    const reactNativeModule = loader('react-native') as { AppState?: AppStateLike };
    return reactNativeModule.AppState;
  } catch {
    return undefined;
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function describeContext(context: Context | undefined): string {
  return context === undefined ? '' : JSON.stringify(context);
}

function describeDefaults(defaults: DefaultsCollection | undefined): string {
  if (defaults === undefined) {
    return '';
  }

  return JSON.stringify(
    defaults
      .keys()
      .sort()
      .map((key) => [key, defaults.get(key)])
  );
}

function applyContextAndDefaults(
  client: Zenmanage,
  context: Context | undefined,
  defaults: DefaultsCollection | undefined
): FlagManager {
  let manager = client.flags();

  if (context) {
    manager = manager.withContext(context);
  }

  if (defaults) {
    manager = manager.withDefaults(defaults);
  }

  return manager;
}

export function FlagsProvider({
  client,
  environmentToken,
  apiEndpoint,
  cacheTtl,
  enableUsageReporting,
  context,
  defaults,
  preload = true,
  onError,
  cache,
  appState,
  refreshOnForeground = true,
  minForegroundRefreshIntervalMs = 30_000,
  backgroundRefreshIntervalMs,
  children,
}: FlagsProviderProps): ReactElement {
  const [currentContext, setCurrentContext] = useState<Context | undefined>(context);
  const [state, setState] = useState<ProviderState>(() => ({
    isLoading: preload,
    isReady: !preload,
    error: null,
    revision: 0,
  }));

  const lastForegroundRefresh = useRef<number>(0);

  // Callers routinely pass `onError` inline, which is a new function every render. Reading it
  // through a ref keeps it out of the dependencies below so it can't restart the preload.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // `context` and `defaults` are often built inline (`context={Context.single('user', id)}`),
  // so compare them by content: a new-but-equal object must not replace the flag manager,
  // which would put every mounted hook back into its loading state on each parent render.
  const contextSignature = describeContext(context);
  const defaultsSignature = describeDefaults(defaults);
  /* eslint-disable react-hooks/exhaustive-deps */
  const stableContext = useMemo(() => context, [contextSignature]);
  const stableDefaults = useMemo(() => defaults, [defaultsSignature]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    setCurrentContext(stableContext);
  }, [stableContext]);

  const resolvedClient = useMemo(() => {
    if (client) {
      return client;
    }

    if (!environmentToken) {
      throw new Error('FlagsProvider requires either a client or an environmentToken.');
    }

    return createReactNativeClient({
      environmentToken,
      apiEndpoint,
      cacheTtl,
      enableUsageReporting,
      cache,
    });
  }, [client, environmentToken, apiEndpoint, cacheTtl, enableUsageReporting, cache]);

  const manager = useMemo(() => {
    return applyContextAndDefaults(resolvedClient, currentContext, stableDefaults);
  }, [resolvedClient, currentContext, stableDefaults]);

  // Re-fetches rules for `target`. A background refresh deliberately doesn't set `isLoading`:
  // hooks keep serving their last value while rules re-fetch, so gated UI doesn't unmount and
  // remount on every foreground or interval refresh. A successful refresh bumps `revision`,
  // which is what makes mounted hooks re-evaluate against the new rules.
  const refreshManager = useCallback(async (target: FlagManager): Promise<void> => {
    try {
      await target.refreshRules();
      setState((current) => ({
        ...current,
        isReady: true,
        error: null,
        revision: current.revision + 1,
      }));
    } catch (error) {
      const resolvedError = toError(error);
      onErrorRef.current?.(resolvedError);
      setState((current) => ({ ...current, error: resolvedError }));
      throw resolvedError;
    }
  }, []);

  const refresh = useCallback(async () => {
    await refreshManager(manager);
  }, [manager, refreshManager]);

  const identify = useCallback(
    async (nextContext: Context, options: IdentifyOptions = {}): Promise<void> => {
      setCurrentContext(nextContext);
      if (options.refresh ?? true) {
        await refreshManager(applyContextAndDefaults(resolvedClient, nextContext, stableDefaults));
      }
    },
    [resolvedClient, stableDefaults, refreshManager]
  );

  const clearIdentity = useCallback(
    async (options: IdentifyOptions = {}): Promise<void> => {
      setCurrentContext(undefined);
      if (options.refresh ?? true) {
        await refreshManager(applyContextAndDefaults(resolvedClient, undefined, stableDefaults));
      }
    },
    [resolvedClient, stableDefaults, refreshManager]
  );

  useEffect(() => {
    let isDisposed = false;

    async function prime(): Promise<void> {
      if (!preload) {
        setState((current) =>
          current.isReady && !current.isLoading && current.error === null
            ? current
            : { ...current, isLoading: false, isReady: true, error: null }
        );
        return;
      }

      setState((current) =>
        current.isLoading && !current.isReady && current.error === null
          ? current
          : { ...current, isLoading: true, isReady: false, error: null }
      );

      try {
        await manager.all();
        if (!isDisposed) {
          setState((current) => ({ ...current, isLoading: false, isReady: true, error: null }));
        }
      } catch (error) {
        if (!isDisposed) {
          const resolvedError = toError(error);
          onErrorRef.current?.(resolvedError);
          setState((current) => ({
            ...current,
            isLoading: false,
            isReady: false,
            error: resolvedError,
          }));
        }
      }
    }

    void prime();

    return () => {
      isDisposed = true;
    };
  }, [manager, preload]);

  useEffect(() => {
    if (!refreshOnForeground) {
      return;
    }

    const runtimeAppState = appState ?? getDefaultAppState();
    if (!runtimeAppState) {
      return;
    }

    const sub = runtimeAppState.addEventListener('change', (nextState: string) => {
      if (nextState !== 'active') {
        return;
      }

      const now = Date.now();
      if (now - lastForegroundRefresh.current < minForegroundRefreshIntervalMs) {
        return;
      }

      lastForegroundRefresh.current = now;
      void refresh().catch(() => undefined);
    });

    return () => {
      sub.remove();
    };
  }, [appState, minForegroundRefreshIntervalMs, refresh, refreshOnForeground]);

  useEffect(() => {
    if (!backgroundRefreshIntervalMs || backgroundRefreshIntervalMs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      void refresh().catch(() => undefined);
    }, backgroundRefreshIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [backgroundRefreshIntervalMs, refresh]);

  const value = useMemo(
    () => ({
      client: resolvedClient,
      manager,
      currentContext,
      defaults: stableDefaults,
      isReady: state.isReady,
      isLoading: state.isLoading,
      error: state.error,
      revision: state.revision,
      refresh,
      identify,
      clearIdentity,
    }),
    [
      resolvedClient,
      manager,
      currentContext,
      stableDefaults,
      state,
      refresh,
      identify,
      clearIdentity,
    ]
  );

  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}
