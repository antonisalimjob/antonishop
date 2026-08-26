# OmniFinance — Project Architecture

OmniFinance is an **offline-first** dual-currency (IDR / USD) finance app. Next.js builds a static site; Capacitor ships it as an Android APK. IndexedDB (Dexie) is the source of truth on device.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 (`output: 'export'`) | Static HTML/JS/CSS, no Node at runtime |
| Shell | Capacitor 7 Android | `appId` `com.omnifinance.app`, `webDir` `out` |
| UI | Tailwind CSS v4 + Lucide | Themeable light/dark, icon-first logging |
| Charts | Recharts | Interactive pie segments with drill-down |
| Persistence | Dexie / IndexedDB | Transactions, wallets, budgets, FX cache |
| FX | Client fetch → Frankfurter, else cached/fallback | Works offline after first quote |
| AI | Client Vision call, else on-device demo parser | Scanner UI never blocks on a server |

## Runtime data flow

```
┌─────────────┐   IDR | USD toggle    ┌──────────────────┐
│  Dashboard  │◄─────────────────────►│  FinanceProvider │
│  Analytics  │                       │  (React state)   │
│  Scan / Log │── writes ────────────►│         │        │
└─────────────┘                       └─────────┬────────┘
                                                │ Dexie
                                                ▼
                                      IndexedDB "OmniFinance"
                                                │
                     online (optional)          │
            ┌────────────────┬──────────────────┘
            ▼                ▼
     Frankfurter USDIDR   OpenAI Vision (Settings key)
```

## Domain rules

1. Every amount is stored three ways: original `amount` + `currency`, frozen `fxRateUsdIdr`, derived `amountIdr` / `amountUsd`.
2. Display currency is a view. Stored rows do not change when the header toggle flips.
3. Budgets alert at 50 / 80 / 100%.
4. First launch seeds demo wallets and transactions so charts are never empty.

## Static export constraints

- No `app/api/*` routes.
- `images.unoptimized: true`.
- `trailingSlash: true` so Capacitor can load `/analytics/index.html`.
- Fonts are self-hosted from the Next build (`next/font`), so the APK does not need Google Fonts at runtime.

Android build steps: [ANDROID.md](./ANDROID.md).
