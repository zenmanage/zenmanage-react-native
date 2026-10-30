# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Requires `@zenmanage/sdk` `^3.5.0` and identifies requests as `zenmanage-react-native` in `X-ZEN-CLIENT-AGENT` instead of the inherited JavaScript default
- `useFlag` accepts JSON flags (objects and arrays), and literal defaults widen to their primitive type (`useFlag('k', false).value` is `boolean`), matching `@zenmanage/react`
- `FlagsContextValue` exposes `revision`, which bumps after each successful rules refresh

### Fixed

- Background, foreground, and interval refreshes no longer set `isLoading`, so `FlagGate` and `withFlag` keep gated UI mounted instead of showing the loading fallback
- Mounted hooks re-evaluate after a refresh, so background refreshes update flag values
- Hooks ignore results from a previous key or context until the new one resolves
- Inline `onError` and `context` props no longer restart preload on every render

## [0.1.0] - 2026-05-08

### Added

- Initial React Native SDK for Zenmanage feature flags
- `FlagsProvider`, `useFlag`, `useBooleanFlag`, `useVariant`, and `useIdentify`
- `identify` and `clearIdentity` flows for account-aware targeting
- `AsyncStorageCache` for persistent local caching
- Foreground and interval-based background refresh behavior
- Comprehensive test suite with strict coverage thresholds
- Expo and bare React Native examples
- CI + release automation and publishing documentation
