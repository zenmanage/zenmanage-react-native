# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-10-30

First public release of `@zenmanage/react-native`.

### Added

- `FlagsProvider` with preload, foreground and interval refresh, `onError`, and an optional `client` or `environmentToken`
- `useFlag`, `useVariant`, and `useBooleanFlag`, with JSON flag support (objects and arrays) and literal defaults widened to their primitive type, matching `@zenmanage/react`
- `FlagGate`, `withFlag`, and `useFlagsContext`
- `identify` and `clearIdentity` flows through `useIdentify`, for account-aware targeting
- `revision` on the provider context, which increments after each successful rules refresh
- `AsyncStorageCache` for persistent local caching
- Requests identify as `zenmanage-react-native/<version>` in `X-ZEN-CLIENT-AGENT`
- Expo and bare React Native examples, plus publishing documentation

### Fixed

- Background, foreground, and interval refreshes no longer set `isLoading`, so gated UI stays mounted instead of showing the loading fallback
- Mounted hooks re-evaluate after a refresh, so background refreshes update flag values
- Hooks ignore results from a previous key or context until the new one resolves
- Inline `onError` and `context` props no longer restart preload on every render
