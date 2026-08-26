# Build the OmniFinance Android APK

The web app is a **static export**. Capacitor wraps `out/` in a WebView. No Node server runs on the phone.

## Prerequisites

1. **Node.js 20+** and npm
2. **JDK 21** (Capacitor 7)
3. **Android Studio** (Meerkat / 2024.3+ is fine) with:
   - Android SDK Platform 35
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
4. Environment (Windows PowerShell, adjust if your SDK path differs):

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

## 1. Install JS dependencies

From the project root (`D:\Money`):

```powershell
cd D:\Money
npm install
```

This installs Next.js, Dexie, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and `@capacitor/app`.

## 2. Static HTML export

```powershell
npm run build
```

Confirms `next.config.ts` has `output: 'export'` and `images.unoptimized: true`. Success creates the `out\` folder (that is `webDir`).

## 3. Add the Android platform (once)

Skip this if the `android\` folder already exists.

```powershell
npx cap add android
```

## 4. Copy the web build into Android and sync plugins

```powershell
npx cap sync android
```

Or in one step after a web change:

```powershell
npm run build:cap
```

(`build:cap` = `next build && npx cap sync`)

## 5. Compile the APK

### Option A — Android Studio (recommended first time)

```powershell
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync.
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Install on a device: **Run** (green play) with a USB phone or emulator.

Debug APK path:

`android\app\build\outputs\apk\debug\app-debug.apk`

### Option B — CLI (no Studio UI)

```powershell
cd D:\Money\android
.\gradlew.bat assembleDebug
```

Same APK path as above.

Release (signed) APK / AAB:

```powershell
cd D:\Money\android
.\gradlew.bat assembleRelease
```

Configure signing in Android Studio (**Build → Generate Signed App Bundle or APK**) before Play Store upload.

## 6. Re-build after UI changes

```powershell
cd D:\Money
npm run build:cap
npx cap open android
```

Then Run in Studio, or `.\gradlew.bat assembleDebug` again.

## Config used by this repo

| Key | Value |
|---|---|
| `appId` | `com.omnifinance.app` |
| `appName` | `OmniFinance` |
| `webDir` | `out` |
| File | `capacitor.config.ts` |

Data never leaves the device unless you opt into FX refresh or Vision with a key stored in Settings.
