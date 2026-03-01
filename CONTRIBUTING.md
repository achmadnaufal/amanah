# Contributing to Amanah

Thank you for your interest in contributing! Amanah is an open-source Islamic personal finance tracker. All contributions — code, docs, bug reports, and feature ideas — are welcome.

## Table of Contents

- [Dev Environment Setup](#dev-environment-setup)
- [Running on Simulator](#running-on-simulator)
- [Code Style](#code-style)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Dev Environment Setup

### 1. Clone and install

```bash
git clone https://github.com/achmadnaufal/amanah.git
cd amanah
npm install
```

### 2. Install Xcode (iOS development)

- Download Xcode 16+ from the Mac App Store
- Open Xcode → Settings → Platforms → install iOS 26.x simulator

### 3. CocoaPods (Ruby 3.3 required)

The system Ruby (4.0+) is incompatible with CocoaPods. Use the pre-configured Ruby 3.3 wrapper:

```bash
# The pod wrapper at /usr/local/bin/pod uses Ruby 3.3
which pod   # should output /usr/local/bin/pod

# Install pods
cd ios && pod install && cd ..
```

If `pod` is not found, see [docs/SETUP.md](docs/SETUP.md) for the full Ruby 3.3 setup.

### 4. Environment

No `.env` file needed — the app has no backend, no API keys required for core functionality.

---

## Running on Simulator

```bash
# Start dev server
npx expo start

# Run on iPhone 17 Pro (iOS 26.2)
npx expo run:ios --device "iPhone 17 Pro"

# Or select device interactively
npx expo run:ios
```

For a full setup walkthrough including Xcode configuration, see [docs/SETUP.md](docs/SETUP.md).

---

## Code Style

- **Language:** TypeScript (strict mode — no `any`)
- **Formatting:** Prettier (default config)
- **Linting:** ESLint with Expo config
- **Components:** Functional components + hooks only
- **State:** Zustand stores in `store/` — one store per domain
- **Styling:** Inline `StyleSheet.create()` using tokens from `constants/colors.ts`

```bash
# Type check
npx tsc --noEmit

# Lint
npx expo lint
```

### File naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `TransactionCard.tsx` |
| Screens (expo-router) | camelCase | `transactions.tsx` |
| Stores | `use` prefix | `useFinanceStore.ts` |
| Utils | camelCase | `zakat.ts` |

### Color usage

Always use tokens from `constants/colors.ts`, never hardcode hex values in components:

```ts
import { Colors } from '@/constants/colors';

// Good
backgroundColor: Colors.background

// Bad
backgroundColor: '#0D1117'
```

---

## Pull Request Guidelines

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Write clean commits** following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `refactor:` code change without feature/fix
   - `test:` adding tests

3. **Test your changes** on iOS Simulator before opening a PR.

4. **Type check passes:**
   ```bash
   npx tsc --noEmit
   ```

5. **Fill in the PR template** when opening your PR on GitHub.

6. **One feature per PR** — keep PRs focused and reviewable.

### What makes a good PR

- Clear description of what changed and why
- Screenshots/screen recordings for UI changes
- Links to related GitHub Issues
- No commented-out code

---

## Reporting Bugs

Use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.md).

## Requesting Features

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.md).

---

## Islamic Finance Principle

When contributing features that involve financial calculations (especially Zakat), please ensure they follow established Islamic finance principles. When in doubt, open a discussion issue before implementing.

---

_Jazakallahu khairan for contributing!_ 🌙
