# Local Setup Guide

Complete guide for setting up the Amanah development environment on macOS.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) or `brew install node` |
| Xcode | 16+ | Mac App Store |
| Ruby | 3.3.x | See below |
| CocoaPods | Latest | See below |

---

## 1. Clone and Install

```bash
git clone https://github.com/achmadnaufal/amanah.git
cd amanah
npm install
```

---

## 2. Xcode Setup

1. Install **Xcode 16+** from the Mac App Store
2. Open Xcode → accept license agreement
3. Install command line tools:
   ```bash
   xcode-select --install
   ```
4. Open **Xcode → Settings → Platforms** → download **iOS 26.x** simulator runtime
5. Verify:
   ```bash
   xcrun simctl list devices | grep "iPhone 17"
   ```

---

## 3. CocoaPods — Ruby 3.3 Fix

> macOS ships with Ruby 4.0+ which is **incompatible with CocoaPods**. A Ruby 3.3 wrapper is pre-configured at `/usr/local/bin/pod`.

### Verify the wrapper

```bash
which pod
# Should output: /usr/local/bin/pod

pod --version
# Should output a CocoaPods version (e.g., 1.15.x)
```

### If the wrapper doesn't work — install Ruby 3.3 via rbenv

```bash
brew install rbenv ruby-build
rbenv install 3.3.0
rbenv global 3.3.0
source ~/.zshrc

gem install cocoapods
pod --version
```

### Install iOS pods

```bash
cd ios && pod install && cd ..
```

If you see errors about `hermes-engine` or `React-Core`:

```bash
cd ios
pod repo update
pod install --repo-update
cd ..
```

---

## 4. Run on iOS Simulator

```bash
# Build and launch on iPhone 17 Pro
npx expo run:ios --device "iPhone 17 Pro"

# Or interactively
npx expo start
# Press 'i' for iOS Simulator
```

**First run is slow (~3–5 min)** — builds the native bundle. Subsequent runs use cache.

---

## 5. Run on Android (optional)

```bash
# Requires Android Studio + SDK
npx expo run:android
```

---

## 6. Run in Web Browser

```bash
npx expo start --web
# Opens at http://localhost:8081
```

---

## Troubleshooting

### Metro bundler port conflict
```bash
npx expo start --port 8082
```

### CocoaPods lock conflict
```bash
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

### Xcode build fails: DerivedData
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Bundle ID warning

Current bundle ID is `com.anonymous.amanah`. Before App Store submission, update in:
- `app.json` → `expo.ios.bundleIdentifier`
- Re-run `npx expo prebuild` to regenerate native files

---

## Environment Reference

| Item | Value |
|------|-------|
| Simulator | iPhone 17 Pro, iOS 26.2 |
| Bundle ID | com.anonymous.amanah |
| Pod binary | /usr/local/bin/pod (Ruby 3.3) |
| Host | Mac mini (arm64) |
| React Native | 0.83 |
