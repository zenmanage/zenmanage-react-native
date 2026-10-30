import { describe, expect, it } from 'vitest';
import * as RNSdk from '../src';

describe('public exports', () => {
  it('exports all public API members', () => {
    expect(RNSdk.FlagsProvider).toBeDefined();
    expect(RNSdk.FlagGate).toBeDefined();
    expect(RNSdk.withFlag).toBeDefined();
    expect(RNSdk.useFlag).toBeDefined();
    expect(RNSdk.useVariant).toBeDefined();
    expect(RNSdk.useBooleanFlag).toBeDefined();
    expect(RNSdk.useFlagsContext).toBeDefined();
    expect(RNSdk.useIdentify).toBeDefined();
    expect(RNSdk.AsyncStorageCache).toBeDefined();
    expect(RNSdk.createReactNativeClient).toBeDefined();
    expect(RNSdk.isReactNativeLikeRuntime).toBeDefined();
  });
});
