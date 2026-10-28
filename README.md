# Desi Journey Studio

Desi Journey Studio is a web-based travel operations and itinerary management application designed for tour operators and travel agencies. It provides an integrated system for managing customer leads, building day-by-day itineraries, calculating trip costings, and generating formatted customer proposals.

---

## Overview

The platform coordinates the entire lifecycle of custom holiday planning and operations:

- **Lead Management:** Inbound enquiry tracking, contact history, and pipeline progression.
- **Itinerary Planning:** Day-wise travel timeline formulation, route sequencing, and activity scheduling.
- **Consolidated Stays:** Consecutive days spent in the same destination (e.g., multi-day stays) can be grouped into unified sections containing day-by-day sightseeing details.
- **Costing and Margin Engine:** Live tour costing incorporating hotel rates, vehicle tariffs, driver allowances, markup margins (percentage or fixed amount), and goods and services tax (GST).
- **Dual Disclosure Modes:**
  - *Masked (Pre-Advance):* Redacts exact hotel property names and driver contact details to protect commercial supplier arrangements prior to booking confirmation.
  - *Disclosed (Confirmed):* Discloses full property names, room categories, driver details, and vehicle numbers once a booking deposit is recorded.
- **Proposal Export and Sharing:** Print-ready PDF documents formatted to prevent awkward page breaks, pre-formatted WhatsApp share links, and email dispatch.
- **Master Databases:** Structured catalogs for hotel properties, transport fleet vehicles, sightseeing attractions, supplier accounts, and reusable rule presets.
- **Data Persistence:** Backed by Google Cloud Firestore with local browser storage (`localStorage`) fallback for offline resilience.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router), React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Database** | Firebase Cloud Firestore |
| **AI Services (Optional)** | Google Gemini API (via `@google/genai` / REST) |
| **Testing** | Node.js Test Runner with `tsx` |

---

## Directory Structure

```text
├── public/                 # Static assets, branding logos, and public images
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── api/            # Server endpoints (AI itinerary generation)
│   │   ├── calendar/       # Movement calendar & operations manifest
│   │   ├── destinations/   # Destinations & attractions database
│   │   ├── hotels/         # Hotel property database & rate cards
│   │   ├── itineraries/    # Itinerary management, studio builder & proposal preview
│   │   ├── leads/          # Customer leads and enquiries CRM
│   │   ├── login/          # Standalone authentication entry
│   │   ├── payments/       # Customer payments & supplier ledger
│   │   ├── reports/        # Analytics and performance reports
│   │   ├── settings/       # Company profile, bank details & cloud sync
│   │   ├── suppliers/      # Supplier registry and payment tracker
│   │   ├── templates/      # Pre-made customizable tour packages
│   │   └── vehicles/       # Transport fleet and vehicle tariff cards
│   ├── components/         # Reusable UI components and layouts
│   ├── context/            # AppContext state provider and synchronization logic
│   ├── lib/                # Calculation engines, Firebase configuration & Firestore services
│   └── types/              # TypeScript interface and type declarations
├── test/                   # Automated unit tests for calculation logic
└── package.json            # Project dependencies and operational scripts
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher

### Installation

1. Clone or download the repository to your local machine:
   ```bash
   cd "Desi Journey Studio"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` (or create `.env.local`):
   ```bash
   cp .env.example .env.local
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Configuration & Environment Variables

The application can run in standalone mode with local sample data or connected to Google Cloud Firestore. The following environment variables can be configured in `.env.local`:

```env
# Google Gemini API (Optional for AI itinerary generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Cloud Firestore persistence)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firestore Security Rules

To allow the application to read and write data across all authorized agency laptops, configure your Firestore database rules in the [Firebase Console](https://console.firebase.google.com) under **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Application Modules

| Module | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Operational dashboard displaying active leads, quotation pipeline value, and departure metrics. |
| **Leads CRM** | `/leads` | Management of customer inquiries, contact details, travel requirements, and conversion to itineraries. |
| **Itineraries** | `/itineraries` | List of created quotations and itineraries with status filters and revision tracking. |
| **Itinerary Studio** | `/itineraries/builder` | Multi-step itinerary builder handling destination routing, hotel allocation, transport, and costing. |
| **Proposal Preview** | `/itineraries/[id]/preview` | Customer-facing proposal document supporting PDF print layout, disclosure mode toggling, and sharing links. |
| **Hotels Database** | `/hotels` | Directory of hotel properties with room categories, seasonal rates, meal plan options, and photo links. |
| **Transport Fleet** | `/vehicles` | Vehicle types, seating capacities, and pricing models (per-day, per-kilometer, or fixed circuit rates). |
| **Destinations** | `/destinations` | Geographic catalog of destinations, transfer distance benchmarks, and sightseeing attraction details. |
| **Trip Templates** | `/templates` | Library of pre-configured tour packages that can be loaded and customized for specific inquiries. |
| **Payments** | `/payments` | Tracking of client booking deposits, balance settlements, and payment reference numbers. |
| **Suppliers** | `/suppliers` | Supplier database and payment ledger tracking payables against fulfilled services. |
| **Calendar** | `/calendar` | Chronological departure and tour movement calendar for operational dispatch. |
| **Reports** | `/reports` | Business metrics including quotation conversion rates and destination distribution. |
| **Settings** | `/settings` | Agency company profile, official bank details, default policy presets, and Cloud Firestore synchronization controls. |

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server on port 3000.
- `npm run build`: Compiles the application and generates an optimized production build.
- `npm start`: Runs the built production application.
- `npm test`: Runs automated unit tests covering financial formulas, GST calculation, duration checks, and data sanitization.
- `npm run lint`: Runs ESLint checks on source files.

---

## Testing

Domain logic and mathematical calculations are covered by automated unit tests in `test/calculations.test.ts`:

- Currency formatting using the Indian numbering standard (`formatINR`).
- Validation of travel duration and calendar dates (`calculateTripDuration`).
- Cost aggregation, margin application, and statutory GST calculation (`calculateTourCosting`).
- Pre-advance data sanitization and masking (`sanitizeQuotationForCustomer`).

Execute the test suite with:
```bash
npm test
```
