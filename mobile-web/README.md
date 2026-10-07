# TicketSplit — Mobile Web App (PWA)

A responsive, high-performance Mobile Web App & Progressive Web App (PWA) implementation of the TicketSplit flatmates expense sharing and UPI settlement system.

## Features
- **Total Net Position Hero**: Displays live net balance, UPI Live status, and dual receive/owe pills.
- **Group Details & Tabs**:
  - **Expenses**: Detailed categorized expenses (Groceries 🛒, Utilities ⚡, Rent 🏠, Food 🍕, Travel 🚕).
  - **Balances**: Real-time peer-to-peer debts with 1-tap "Settle via UPI" buttons.
  - **Flat Rules & Rent**: Landlord UPI ID with copy action, monthly rent auto-split, and reminders.
- **Instant UPI Settlement**:
  - Deeplinks for Google Pay, PhonePe, Paytm, and BHIM UPI.
  - Live dynamic QR code generator on HTML5 Canvas.
  - 3-step settlement tracker (UPI Intent ➡️ Bank Progress ➡️ Settled in Group).
- **Add Expense & OCR Scanner**: Real-time split calculator and simulated AI receipt scanning.
- **PWA & Smartphone Ready**: Standalone installable manifest, dark mode switch, and desktop smartphone frame toggle.

## How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

- Local URL: `http://localhost:5173/`
- Scan the "Open on Phone" button in the header from your smartphone camera while connected to local Wi-Fi.
