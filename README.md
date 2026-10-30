# Zenmanage React Native SDK

[![npm version](https://badge.fury.io/js/@zenmanage%2Freact-native.svg)](https://www.npmjs.com/package/@zenmanage/react-native)
[![Build Status](https://github.com/zenmanage/zenmanage-react-native/actions/workflows/ci.yml/badge.svg)](https://github.com/zenmanage/zenmanage-react-native)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

React Native hooks and provider components for Zenmanage feature flags.

This package extends the same core runtime used by `@zenmanage/sdk` and mirrors the API ergonomics of `@zenmanage/react`, with mobile-focused additions:

- `FlagsProvider` with identify/update flows
- `useFlag`, `useBooleanFlag`, `useVariant`, `useIdentify`
- `AsyncStorageCache` for persistent local caching
- foreground and interval refresh controls for mobile app lifecycles

## Why This Package

- Built for React Native and Expo apps
- Supports mobile keys (`mob_...`) and client keys (`cli_...`)
- Works with custom cache backends or included `AsyncStorageCache`
- Explicit loading/error state for resilient UX
- High coverage and CI-enforced quality thresholds

## Installation

```bash
npm install @zenmanage/react-native @zenmanage/sdk react react-native
```

Optional persistent cache dependency (recommended):

```bash
npm install @react-native-async-storage/async-storage
```

## Key Compatibility

- React Native/Expo runtime: use mobile keys prefixed with `mob_`
- Client/browser-compatible flow: client keys prefixed with `cli_`
- Server keys (`srv_`) are rejected by this package

## Quick Start

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

function CheckoutLabel(): JSX.Element {
  const { value: enabled, isLoading } = useFlag('new-checkout', false);

  if (isLoading) {
    return <Text>Loading flags...</Text>;
  }

  return <Text>{enabled ? 'Checkout (New)' : 'Checkout'}</Text>;
}

export function App(): JSX.Element {
  return (
    <FlagsProvider environmentToken="mob_your_mobile_key_here">
      <View style={{ padding: 24 }}>
        <CheckoutLabel />
      </View>
    </FlagsProvider>
  );
}
```

## API

### `FlagsProvider`

Initializes SDK state, exposes manager/context, and supports mobile refresh behavior.

```tsx
<FlagsProvider
  environmentToken="mob_your_mobile_key_here"
  cacheTtl={3600}
  enableUsageReporting={true}
  preload={true}
  refreshOnForeground={true}
  minForegroundRefreshIntervalMs={30000}
  backgroundRefreshIntervalMs={120000}
  onError={(error) => console.error(error)}
>
  <App />
</FlagsProvider>
```

Props:

- `client?`: existing `Zenmanage` client instance
- `environmentToken?`: token used to create internal client
- `apiEndpoint?`: custom API base URL
- `cacheTtl?`: cache TTL in seconds
- `enableUsageReporting?`: usage reporting toggle
- `context?`: base `Context` used for evaluation
- `defaults?`: `DefaultsCollection` fallback values
- `cache?`: custom cache implementation (`Cache`)
- `preload?`: preload all flags on mount (default: `true`)
- `refreshOnForeground?`: refresh when app returns to foreground (default: `true`)
- `minForegroundRefreshIntervalMs?`: debounce for foreground refreshes (default: `30000`)
- `backgroundRefreshIntervalMs?`: periodic refresh interval in ms (optional)
- `appState?`: custom `AppState` adapter (for testing/advanced control)
- `onError?`: preload/refresh error callback

### `useFlag(key, defaultValue)`

```tsx
const { value, flag, isLoading, error, refresh } = useFlag('checkout-v2', false);
```

### `useVariant(key, defaultVariant = 'control')`

```tsx
const { variant } = useVariant('checkout-flow', 'control');
```

### `useBooleanFlag(key, defaultValue = false)`

```tsx
const { value } = useBooleanFlag('mobile-payments', false);
```

### JSON flags

Pass an object or array as the default to read a JSON flag. Type it with a generic when the default doesn't say enough:

```tsx
const { value } = useFlag('onboarding-config', { steps: 3, skippable: false });
const { value: ranks } = useFlag<number[]>('ranking-weights', []);
```

### `withFlag(key, options)`

Wraps a component so it renders only when the flag is on (or off, with `invert`):

```tsx
const BetaCheckout = withFlag('beta-checkout', {
  invert: false,
  loadingFallback: <Spinner />,
  disabledFallback: <LegacyCheckout />,
})(NewCheckout);
```

### `FlagGate`

Declarative conditional rendering:

```tsx
<FlagGate flagKey="beta-chat" loadingFallback={<Spinner />} disabledFallback={<LegacyChat />}>
  <BetaChat />
</FlagGate>
```

Background and foreground refreshes never show `loadingFallback`. Gated UI stays mounted while rules re-fetch, and its value updates once the new rules land.

### `useFlagsContext()`

Returns the provider's state: `manager`, `client`, `isReady`, `isLoading`, `error`, `revision`, and `refresh()`. `revision` increments after each successful rules refresh.

### `useIdentify()`

Identity-focused helper for login/logout or account switching.

```tsx
import { Context } from '@zenmanage/sdk';

const { identify, clearIdentity, currentContext } = useIdentify();

await identify(Context.single('user', 'user-123')); // refreshes by default
await clearIdentity(); // clears context and refreshes by default
```

### `createReactNativeClient(options)`

Programmatic client creation for advanced setups.

```tsx
import { createReactNativeClient } from '@zenmanage/react-native';

const client = createReactNativeClient({
  environmentToken: 'mob_your_mobile_key_here',
  cacheTtl: 600,
});
```

### `AsyncStorageCache`

Persistent cache adapter for React Native.

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageCache } from '@zenmanage/react-native';

const cache = new AsyncStorageCache({
  storage: AsyncStorage,
  keyPrefix: 'zenmanage',
});
```

Use it with `FlagsProvider`:

```tsx
<FlagsProvider environmentToken="mob_key" cache={cache}>
  <App />
</FlagsProvider>
```

## Usage Patterns

### Context-Based Targeting

```tsx
import { Attribute, Context } from '@zenmanage/sdk';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

const userContext = new Context('user', 'Jane', 'user-123', [
  new Attribute('country', ['US']),
  new Attribute('plan', ['pro']),
]);

function PremiumBanner(): JSX.Element | null {
  const { value } = useFlag('premium-banner', false);
  return value ? <Text>Premium Banner</Text> : null;
}

export function App(): JSX.Element {
  return (
    <FlagsProvider environmentToken="mob_key" context={userContext}>
      <PremiumBanner />
    </FlagsProvider>
  );
}
```

### Login / Account-Switch Identity Flow

```tsx
import { Context } from '@zenmanage/sdk';
import { useIdentify } from '@zenmanage/react-native';

const { identify, clearIdentity } = useIdentify();

await identify(Context.single('user', 'user-42')); // after login
await clearIdentity(); // after logout
```

## Examples

See [examples/README.md](examples/README.md) for a full set of examples matching core SDK use-cases:

- `simple-flags.tsx`
- `context-based-flags.tsx`
- `ab-testing.tsx`
- `defaults.tsx`
- `caching.tsx`
- `percentage-rollouts.tsx`
- Expo app sample: `examples/expo-app/App.tsx`
- Bare React Native sample: `examples/bare-react-native/App.tsx`

## Development

```bash
npm install
npm run validate
```

Useful commands:

- `npm run lint`
- `npm run type-check`
- `npm run test:coverage`
- `npm run build`

## Publishing

Use [docs/PUBLISHING_NEXT_STEPS.md](docs/PUBLISHING_NEXT_STEPS.md).

Automated releases are configured with Changesets via:

- `.changeset/config.json`
- `.github/workflows/release.yml`

## License

MIT
