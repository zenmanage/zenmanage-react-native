import { describe, expect, it } from 'vitest';
import type { Logger } from '@zenmanage/sdk';
import {
  buildReactNativeConfig,
  createReactNativeClient,
  isReactNativeLikeRuntime,
} from '../src/createClient';

describe('buildReactNativeConfig', () => {
  it('identifies the package as zenmanage-react-native instead of the inherited JS default', () => {
    const config = buildReactNativeConfig({ environmentToken: 'mob_example' });

    expect(config.clientAgent).toBe('zenmanage-react-native');
    expect(config.sdkVersion).toBe('0.1.0');
  });
});

describe('createReactNativeClient', () => {
  it('accepts mobile token', () => {
    const client = createReactNativeClient({ environmentToken: 'mob_example' });
    expect(client.flags).toBeDefined();
  });

  it('accepts client token', () => {
    const client = createReactNativeClient({ environmentToken: 'cli_example' });
    expect(client.flags).toBeDefined();
  });

  it('rejects server token', () => {
    expect(() => createReactNativeClient({ environmentToken: 'srv_example' })).toThrow(
      'Invalid environment token for React Native runtime: server key provided. Use cli_... or mob_...'
    );
  });

  it('rejects malformed token', () => {
    expect(() => createReactNativeClient({ environmentToken: 'abc_example' })).toThrow(
      'Invalid environment token format. Expected cli_... or mob_...'
    );
  });

  it('detects runtime using navigator', () => {
    expect(typeof isReactNativeLikeRuntime()).toBe('boolean');
  });

  it('returns true when navigator indicates ReactNative', () => {
    const previousNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: { product: 'ReactNative' },
      configurable: true,
    });

    expect(isReactNativeLikeRuntime()).toBe(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: previousNavigator,
      configurable: true,
    });
  });

  it('accepts explicit logger and cache options', () => {
    const logger: Logger = {
      debug: () => undefined,
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    };
    const cache = {
      get: async () => null,
      set: async () => undefined,
      has: async () => false,
      delete: async () => undefined,
      clear: async () => undefined,
    };

    const client = createReactNativeClient({
      environmentToken: 'mob_with_options',
      logger,
      cache,
      apiEndpoint: 'https://api.zenmanage.com',
      cacheTtl: 120,
      enableUsageReporting: false,
    });

    expect(client.flags).toBeDefined();
  });
});
