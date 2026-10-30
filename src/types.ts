import type { PropsWithChildren } from 'react';
import type {
  Cache,
  Config,
  Context,
  DefaultsCollection,
  Flag,
  FlagManager,
  FlagValue,
  Logger,
  Zenmanage,
} from '@zenmanage/sdk';

export type PrimitiveFlagValue = boolean | string | number;

/**
 * Widens a literal default (`false`, `'control'`, `1500`) to its primitive type, so
 * `useFlag('k', false).value` is `boolean` rather than the literal `false`. Object and
 * array defaults (JSON flags) pass through unchanged.
 */
export type WidenFlagValue<T extends FlagValue> = T extends boolean
  ? boolean
  : T extends number
    ? number
    : T extends string
      ? string
      : T;

export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AppStateSubscription {
  remove(): void;
}

export interface AppStateLike {
  addEventListener(type: 'change', listener: (state: string) => void): AppStateSubscription;
}

export interface CreateReactNativeClientOptions {
  environmentToken: string;
  apiEndpoint?: string;
  cacheTtl?: number;
  enableUsageReporting?: boolean;
  cache?: Cache;
  logger?: Logger;
}

export interface IdentifyOptions {
  refresh?: boolean;
}

export interface FlagsProviderProps extends PropsWithChildren {
  client?: Zenmanage;
  environmentToken?: string;
  apiEndpoint?: string;
  cacheTtl?: number;
  enableUsageReporting?: boolean;
  context?: Context;
  defaults?: DefaultsCollection;
  preload?: boolean;
  onError?: (error: Error) => void;
  cache?: Cache;
  appState?: AppStateLike;
  refreshOnForeground?: boolean;
  minForegroundRefreshIntervalMs?: number;
  backgroundRefreshIntervalMs?: number;
}

export interface FlagsContextValue {
  client: Zenmanage;
  manager: FlagManager;
  currentContext?: Context;
  defaults?: DefaultsCollection;
  isReady: boolean;
  /** `true` only while the initial preload is in flight; background refreshes don't set it. */
  isLoading: boolean;
  error: Error | null;
  /** Bumps after every successful rules refresh so mounted hooks re-evaluate. */
  revision: number;
  refresh: () => Promise<void>;
  identify: (context: Context, options?: IdentifyOptions) => Promise<void>;
  clearIdentity: (options?: IdentifyOptions) => Promise<void>;
}

export interface UseFlagResult<T extends FlagValue> {
  key: string;
  value: T;
  flag: Flag | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseVariantResult {
  key: string;
  variant: string;
  flag: Flag | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface WithFlagOptions {
  defaultValue?: FlagValue;
  invert?: boolean;
  loadingFallback?: React.ReactNode;
  disabledFallback?: React.ReactNode;
}

export interface AsyncStorageCacheOptions {
  storage: AsyncStorageLike;
  keyPrefix?: string;
}

export type ReactNativeClientConfig = Omit<Config, 'environmentToken'> & {
  environmentToken: string;
};
