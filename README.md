# Desi Journey Studio — Travel CRM & Itinerary Operations Platform

> **Production-minded, responsive web application for Desi Journey**, an Indian boutique travel agency and tour operator. Built with Next.js 14 App Router, TypeScript, Tailwind CSS ("Alpine Premium" design system), and domain-tested calculation engines.

---

## 🌟 Executive Summary & Key Highlights

Desi Journey Studio provides a single operating system bridging customer acquisition, tour formulate wizardry, inventory management, dynamic cost calculation, and post-booking fulfillment:

1. **Dual-Mode Privacy & Disclosure Engine (Core Business Rule):**
   - **Pre-Advance Quotation Mode (`masked`):** Replaces exact hotel names with category descriptions (e.g., *"Selected 4-Star Premium Resort, Mall Road Area or Similar"*). Driver phone numbers, vehicle registrations, and internal supplier costs are strictly redacted.
   - **Confirmed Trip Mode (`disclosed`):** Automatically reveals confirmed hotel names, room categories, driver name, and vehicle license plate once the 30% advance deposit is recorded.
2. **Flagship 8-Step Itinerary Studio:**
   - Sequential step wizard: Guest & Trip Setup, Route Sequencing, Day-wise Timeline Builder, Hotel & Meal Plan (EP/CP/MAP/AP) Allocation, Vehicle Pricing Engine, Live Costing & Profit Margins, Terms Checklist, and Customer Proposal Preview.
3. **Live Costing & Tour Operator GST Engine:**
   - Real-time calculation of hotel rooms, transport models (per-day, per-km, packages), guide & permits, configurable agency margins (% or fixed INR), and 5% SAC 998555 GST toggle.
4. **Instant Distribution & Print-Optimized PDF Export:**
   - Generates crystal-clear, zero-clipping multi-page PDFs using CSS print media rules (`@media print`).
   - One-click formatted WhatsApp link with prefilled proposal summary and interactive web proposal link.
   - Email composer with native mail client triggering.
5. **Master Inventories & Operations Manifest:**
   - Hotel database with star ratings, meal plans, and double/extra-bed rates.
   - Fleet database with capacity and tariff cards.
   - Regional destination knowledge base with verified attractions and route templates.
   - Suppliers accounts ledger and customer collections with UTR tracking.
   - Tour calendar movement chart with one-click Hotel Vouchers and Chauffeur Duty Slips.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript (Strict Mode)
- **Styling & UI:** Tailwind CSS with the **"Alpine Premium"** design palette:
  - Deep Forest Green (`#173F35`) — authoritative, trustworthy
  - Secondary Emerald (`#267A62`) — interactive accents
  - Warm Canvas Stone (`#F7F5EE`) — eye-fatigue reducing background
  - Premium Accent Gold (`#D4A64B`) — proposal luxury accents
- **Icons:** `lucide-react`
- **State & Storage:** Reactive Context API with LocalStorage sync and seamless Firestore / Firebase compatibility.
- **Testing:** Node.js native test runner with `tsx` (`test/calculations.test.ts`).

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ LTS
- **npm**: v9+

### 2. Installation
```bash
# Clone the repository and navigate to the directory
cd "Desi Journey Studio"

# Install project dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: The application runs 100% out of the box with offline mock persistence and local fallbacks without requiring live third-party API keys).*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Running Automated Unit Tests
```bash
npm test
```
Executes domain calculations, GST slabs, nights/dates validation, and Pre-Advance redaction tests.

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🧭 Navigation & Modules Sitemap

| # | Workspace Module | Route | Purpose & Key Features |
|---|---|---|---|
| 1 | **Command Center** | `/` | Executive KPI cards, urgent follow-up SLA queue, upcoming departures, phone rate estimator. |
| 2 | **Leads & Guests CRM** | `/leads` | Inbound pipeline, SLA countdowns, WhatsApp direct chat, 1-click Itinerary Studio pre-fill. |
| 3 | **Itineraries & Quotes** | `/itineraries` | Master proposals ledger, version history (`v1`, `v2`), disclosure mode indicator. |
| 4 | **Itinerary Studio** | `/itineraries/builder` | 8-step wizard formulating day-by-day schedules, hotels, vehicles, margins, and preview. |
| 5 | **Customer Proposal** | `/itineraries/[id]/preview` | Print-ready PDF proposal view, WhatsApp share composer, Pre-Advance toggle. |
| 6 | **Hotel Database** | `/hotels` | Property directory, EP/CP/MAP/AP rate cards, masked names, CSV export. |
| 7 | **Vehicles & Fleet** | `/vehicles` | Transport fleet, per-day/per-km tariffs, driver night allowance, toll budgets. |
| 8 | **Destinations & Sights** | `/destinations` | Knowledge base of attractions, duration estimates, verified status, route circuits. |
| 9 | **Suppliers & Ledger** | `/suppliers` | Vendor agreements, agreed payable vs paid, UTR payout logger. |
| 10 | **Tour Calendar & Ops** | `/calendar` | Movement chart, departure manifests, Chauffeur Duty Slips & Hotel Vouchers. |
| 11 | **Collections & Receipts** | `/payments` | 30% booking advance tracking, installment ledger, GST receipts. |
| 12 | **Business Intelligence** | `/reports` | Tour conversion funnel, quoted vs realized margins, destination share. |
| 13 | **Settings & Templates** | `/settings` | Agency branding, HDFC bank details, UPI VPA, terms, demo data reset. |

---

## 🔒 Security & Role Simulator

Use the **Role Switcher** in the top navbar to simulate distinct team perspectives:
- **Admin / Agency Owner:** Full read/write across master costing, profit margins, bank details, and settings.
- **Sales & Itinerary Planner:** Lead capture, day builder, and proposal sharing. Wholesale costs are hidden from customer exports.
- **Operations & Dispatch:** Confirmed departures, chauffeurs, vouchers, and room manifests.
- **Accounts & Finance:** Advances, UTR references, receipts, and supplier payouts.

---

## ☁️ Firebase Deployment Guide

When you are ready to connect to production Cloud Firestore and Firebase Hosting:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password & Google Sign-In).
3. Enable **Cloud Firestore** and deploy the included security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Update `.env.local` with your Firebase project keys from Project Settings.
5. Deploy to Firebase Hosting / Vercel:
   ```bash
   # Deploying to Vercel (recommended for Next.js App Router)
   vercel --prod
   ```

---

## 🧪 Automated Test Suite

Unit tests in `test/calculations.test.ts` verify:
1. `formatINR`: Indian numeral grouping (`₹1,57,500`).
2. `calculateTripDuration`: Strict night and day consistency (`5N = 6D`).
3. `calculateTourCosting`: Wholesale sum, configurable markup, 5% GST toggle, advance required.
4. `calculateTourCosting (No GST)`: Fixed markup without tax.
5. `sanitizeQuotationForCustomer`: Pre-advance redaction of exact hotel names, confidential driver notes, and internal wholesale margins.

Run them anytime with:
```bash
npm test
```

---

## 🔄 Resetting Showcase Demo Data
At any time, click the **Reset Icon** in the top navbar or navigate to **Settings & Profile** and click **"Reset Demo Data"** to restore fresh, pre-configured sample leads, hotels, vehicles, itineraries, and settings.
