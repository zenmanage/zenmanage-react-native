import { act, render, waitFor } from '@testing-library/react';
import { Context, DefaultsCollection } from '@zenmanage/sdk';
import { describe, expect, it, vi } from 'vitest';
import { FlagsProvider } from '../src/FlagsProvider';
import { useFlagsContext } from '../src/context';
import { createMockClient, createMockManager } from './test-utils';

function ContextProbe(): JSX.Element {
  const state = useFlagsContext();

  return (
    <div>
      <span data-testid="ready">{String(state.isReady)}</span>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="has-error">{String(Boolean(state.error))}</span>
    </div>
  );
}

describe('FlagsProvider', () => {
  it('throws if neither client nor environmentToken is provided', () => {
    expect(() => render(<FlagsProvider>{null}</FlagsProvider>)).toThrow(
      'FlagsProvider requires either a client or an environmentToken.'
    );
  });

  it('marks provider as ready after preload', async () => {
    const manager = createMockManager({ 'new-ui': true });
    const client = createMockClient(manager);

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload>
        <ContextProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('ready').textContent).toBe('true'));
    expect(getByTestId('has-error').textContent).toBe('false');
  });

  it('applies context and defaults to the flag manager', async () => {
    const manager = createMockManager({});
    const client = createMockClient(manager);
    const context = Context.single('user', '123');
    const defaults = DefaultsCollection.fromObject({ 'flag-a': true });

    render(
      <FlagsProvider client={client as never} preload={false} context={context} defaults={defaults}>
        <ContextProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(manager.withContext).toHaveBeenCalledWith(context));
    expect(manager.withDefaults).toHaveBeenCalledWith(defaults);
  });

  it('invokes onError when preload fails', async () => {
    const manager = createMockManager();
    manager.all = vi.fn(async () => {
      throw new Error('network issue');
    });
    const client = createMockClient(manager);
    const onError = vi.fn();

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload onError={onError}>
        <ContextProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('has-error').textContent).toBe('true'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('surfaces refresh errors and invokes onError', async () => {
    const manager = createMockManager({});
    manager.refreshRules = vi.fn(async () => {
      throw new Error('refresh failed');
    });
    const client = createMockClient(manager);
    const onError = vi.fn();

    let refreshFn: (() => Promise<void>) | null = null;

    function RefreshProbe(): JSX.Element {
      const state = useFlagsContext();
      refreshFn = state.refresh;
      return <div data-testid="error-state">{String(Boolean(state.error))}</div>;
    }

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload={false} onError={onError}>
        <RefreshProbe />
      </FlagsProvider>
    );

    expect(refreshFn).not.toBeNull();

    await act(async () => {
      await expect(refreshFn!()).rejects.toThrow('refresh failed');
    });

    await waitFor(() => expect(getByTestId('error-state').textContent).toBe('true'));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('supports identify and clear identity flows', async () => {
    const manager = createMockManager({});
    const client = createMockClient(manager);

    let identifyFn: ((context: Context) => Promise<void>) | null = null;
    let clearIdentityFn: (() => Promise<void>) | null = null;

    function IdentityProbe(): JSX.Element {
      const state = useFlagsContext();
      identifyFn = (context: Context) => state.identify(context, { refresh: true });
      clearIdentityFn = () => state.clearIdentity({ refresh: true });
      return <div data-testid="ready-state">{String(state.isReady)}</div>;
    }

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload={false}>
        <IdentityProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('ready-state').textContent).toBe('true'));

    await act(async () => {
      await identifyFn!(Context.single('user', 'user-42'));
    });

    await act(async () => {
      await clearIdentityFn!();
    });

    expect(manager.refreshRules).toHaveBeenCalledTimes(2);
  });

  it('refreshes when app returns to foreground', async () => {
    const manager = createMockManager({});
    const client = createMockClient(manager);

    let listener: ((state: string) => void) | null = null;
    const appState = {
      addEventListener: vi.fn((_event: 'change', cb: (state: string) => void) => {
        listener = cb;
        return {
          remove: vi.fn(),
        };
      }),
    };

    render(
      <FlagsProvider
        client={client as never}
        preload={false}
        appState={appState}
        refreshOnForeground
        minForegroundRefreshIntervalMs={0}
      >
        <ContextProbe />
      </FlagsProvider>
    );

    await act(async () => {
      listener?.('background');
      listener?.('active');
    });

    expect(manager.refreshRules).toHaveBeenCalledTimes(1);
  });

  it('does not subscribe to app foreground refresh when disabled', async () => {
    const manager = createMockManager({});
    const client = createMockClient(manager);

    const appState = {
      addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    };

    render(
      <FlagsProvider
        client={client as never}
        preload={false}
        appState={appState}
        refreshOnForeground={false}
      >
        <ContextProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(appState.addEventListener).toHaveBeenCalledTimes(0));
  });

  it('supports interval-based background refresh', async () => {
    vi.useFakeTimers();

    const manager = createMockManager({});
    const client = createMockClient(manager);

    render(
      <FlagsProvider client={client as never} preload={false} backgroundRefreshIntervalMs={5000}>
        <ContextProbe />
      </FlagsProvider>
    );

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    expect(manager.refreshRules).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});
