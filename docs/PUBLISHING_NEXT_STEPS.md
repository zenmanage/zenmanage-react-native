# Publishing Next Steps

This guide covers publishing `@zenmanage/react-native` to public package registries.

## 1. Pre-Release Checklist

Run from package root:

```bash
npm install
npm run validate
```

Confirm all items:

- `README.md` reflects the current API
- `CHANGELOG.md` includes release notes
- version in `package.json` is correct
- CI passes on pull request and on default branch
- Expo and bare React Native examples are still valid

## 2. Publish to npm (Primary)

Authenticate:

```bash
npm whoami || npm login
```

Dry-run package contents:

```bash
npm pack --dry-run
```

Publish:

```bash
npm publish --access public
```

Verify:

- package is visible at `https://www.npmjs.com/package/@zenmanage/react-native`
- install works in clean Expo and bare RN sample apps

## 3. Publish to GitHub Packages (Secondary Public Registry)

Configure auth (`.npmrc` or CI environment):

```ini
@zenmanage:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Publish:

```bash
npm publish --registry https://npm.pkg.github.com
```

Notes:

- use npm as the canonical open-source distribution endpoint
- use GitHub Packages for mirroring or enterprise consumers

## 4. Automated Releases with Changesets

This package is configured with Changesets.

Create a release note entry:

```bash
npm run changeset
```

Version packages from pending changesets:

```bash
npm run version-packages
```

Publish from CI (recommended):

- push to `main`
- ensure `NPM_TOKEN` exists in repository secrets
- release workflow creates version PR or publishes

Workflow file: `.github/workflows/release.yml`

## 5. Post-Release Validation

- install in Expo app and verify runtime behavior
- install in bare RN app and verify runtime behavior
- verify ESM + CJS imports
- verify type declarations and autocompletion
- verify `useIdentify`, caching, and foreground refresh behavior

## 6. Registry Strategy

- Primary: npm (`@zenmanage/react-native`)
- Secondary: GitHub Packages mirror (optional)
- Keep versions and tags synchronized across registries

## 7. Security and Supply Chain

- enforce 2FA on publish accounts
- protect release branches and tags
- prefer short-lived automation tokens with least privilege
- enable npm provenance in CI where available
