# Zenmanage React Native SDK Examples

This directory contains examples that mirror the core SDK use-cases while using React Native hooks/components.

## Setup

```bash
npm install
export ZENMANAGE_ENVIRONMENT_TOKEN="mob_your_mobile_key_here"
```

Then copy any example into your app and adjust imports as needed.

## Examples

### simple-flags.tsx

Basic usage of `FlagsProvider` and `useFlag`.

### context-based-flags.tsx

Context-based targeting with `Context` and `Attribute`.

### ab-testing.tsx

Variant-based rendering with `useVariant`.

### defaults.tsx

Default values and `DefaultsCollection` behavior.

### caching.tsx

Persistent cache setup with `AsyncStorageCache`.

### percentage-rollouts.tsx

Deterministic rollout behavior using user identifiers.

### expo-app/App.tsx

Expo-oriented app wiring with provider and hooks.

### bare-react-native/App.tsx

Bare React Native app wiring with provider and hooks.
