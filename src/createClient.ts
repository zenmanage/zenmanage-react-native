import { Zenmanage } from '@zenmanage/sdk';
import type { Cache, Config, Logger } from '@zenmanage/sdk';
import type { CreateReactNativeClientOptions } from './types';

const SERVER_KEY_PREFIX = 'srv_';
const CLIENT_KEY_PREFIX = 'cli_';
const MOBILE_KEY_PREFIX = 'mob_';

// Sent as X-ZEN-CLIENT-AGENT so the API can tell this package apart from the
// underlying @zenmanage/sdk. Must be allow-listed in api's EnsureClientAgentIsValid.
const CLIENT_AGENT = 'zenmanage-react-native';
// Keep in sync with package.json "version".
const SDK_VERSION = '0.1.0';

const noop = (): void => undefined;

const NULL_LOGGER: Logger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

function validateReactNativeToken(token: string): void {
  if (token.startsWith(SERVER_KEY_PREFIX)) {
    throw new Error(
      `Invalid environment token for React Native runtime: server key provided. Use ${CLIENT_KEY_PREFIX}... or ${MOBILE_KEY_PREFIX}...`
    );
  }

  if (!token.startsWith(CLIENT_KEY_PREFIX) && !token.startsWith(MOBILE_KEY_PREFIX)) {
    throw new Error(
      `Invalid environment token format. Expected ${CLIENT_KEY_PREFIX}... or ${MOBILE_KEY_PREFIX}...`
    );
  }
}

export function buildReactNativeConfig({
  environmentToken,
  apiEndpoint,
  cacheTtl,
  enableUsageReporting,
  cache,
  logger,
}: CreateReactNativeClientOptions): Config {
  validateReactNativeToken(environmentToken);

  return {
    environmentToken,
    apiEndpoint: apiEndpoint ?? 'https://api.zenmanage.com',
    cacheTtl: cacheTtl ?? 3600,
    cacheBackend: cache ? undefined : 'memory',
    customCache: cache,
    enableUsageReporting: enableUsageReporting ?? true,
    logger: logger ?? NULL_LOGGER,
    clientAgent: CLIENT_AGENT,
    sdkVersion: SDK_VERSION,
  };
}

export function createReactNativeClient(options: CreateReactNativeClientOptions): Zenmanage {
  return new Zenmanage(buildReactNativeConfig(options));
}

export function isReactNativeLikeRuntime(): boolean {
  const runtimeNavigator = (globalThis as { navigator?: { product?: string } }).navigator;
  return runtimeNavigator?.product === 'ReactNative';
}

export type { Cache };
