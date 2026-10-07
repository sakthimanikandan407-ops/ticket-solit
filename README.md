# TicketSplit (Ticket-Solit) 🎟️⚡

TicketSplit is a smart expense sharing and instant UPI settlement platform for flatmates and group living. It simplifies tracking shared utilities, groceries, rent, and one-tap settling up through popular UPI apps.

---

## 📁 Repository Structure

```
.
├── android/          # Native Android Jetpack Compose Application
│   ├── app/          # Main Android module (Jetpack Compose, UPI launcher, ViewModels)
│   ├── gradle/       # Gradle wrapper and version catalogs
│   └── docs/         # Business plan and user flow documentation
│
└── mobile-web/       # Mobile Web & Progressive Web App (PWA)
    ├── src/          # Frontend application (Vanilla JS, CSS design system, UPI intent)
    ├── public/       # PWA manifest and static assets
    └── test-reports/ # End-to-end testing logs
```

---

## 📱 1. Android Application (`android/`)

Native Android app built using **Kotlin** and **Jetpack Compose**.

### Key Features
- **Dynamic UPI Deeplinking**: Direct payment intents to Google Pay, PhonePe, Paytm, and BHIM.
- **Smart Debt Simplification**: Calculates minimum peer-to-peer settlement paths.
- **Modern Jetpack Compose UI**: Edge-to-edge Material 3 styling.

### Getting Started
Open the [`android`](./android) directory in **Android Studio** (Hedgehog or newer) and sync with Gradle.

---

## 🌐 2. Mobile Web App & PWA (`mobile-web/`)

High-performance mobile-first web app & Progressive Web App.

### Key Features
- **Net Position Hero**: Real-time balance and settlement status.
- **Instant UPI Settlement**: Deeplinks for Google Pay, PhonePe, Paytm, and live dynamic QR code generator on HTML5 Canvas.
- **Expense Categorization**: Real-time split calculations for groceries, rent, utilities, and dining.
- **PWA Ready**: Installable to home screen on iOS and Android devices.

### Getting Started
```bash
cd mobile-web
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📄 License
Private repository / All rights reserved.
