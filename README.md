# BhandarSetu — भंडारसेतु
## Smart Commodity Inventory & Deterministic FIFO Management System

> **“Har batch ka hisaab, har dispatch ka record.”**
> Enterprise Foodgrain Warehouse Stock Allocation, Rule 14-B FIFO Liquidation Engine, Quality Quarantine Gating, and Immutable Double-Entry Ledger for Public Distribution System (PDS) Godowns.

---

## 🌾 Overview

**BhandarSetu — भंडारसेतु** is an integrated, production-minded commodity inventory management web application tailored for public and state-level foodgrain warehousing (e.g., Food & Civil Supplies, State Warehousing Corporations, and FCI-linked depots).

Designed to enforce **Departmental FIFO Rule 14-B** and **NFSA Section 12(2)**, the system replaces prone-to-error manual registers with automated, tamper-evident inventory tracking, quality hold restrictions, weighbridge gross/tare reconciliation, and cryptographic delivery challans.

---

## 🏛️ Key Capabilities & Modules

1. **Godown Overview & Daily Balance Dashboard**
   - 6 Operational KPI metrics: Total Usable Stock, Reserved FPS Stock, Under Inspection Hold, Gate Inward Receipts, FPS Dispatches Scheduled, and FIFO Critical Ageing Alert.
   - Live telemetry banner (ambient temperature & relative humidity sensor simulation).
   - Commodity Stock & FIFO Priority Register across Wheat, Rice, Sugar, and Chana.
   - Actionable alert cards (Lab Re-Test Hold Notice, FIFO Exception Approval Pending, Gate Weighbridge Consignment).
   - Real-time stock movement feed and Godown Shed Occupancy meters.

2. **Inventory & Batches Register**
   - Full batch lifecycle tracking: Intake timestamp, source agency, physical shed/bay/stack location, initial vs on-hand vs reserved quantities, and age in days.
   - Selected Batch Summary Panel with NABL/FCI quality metrics: Moisture %, Grain Density (kg/hl), Foreign Matter %, and Weevilled Grain %.
   - Interactive Shed 01 & 02 Physical Stack Bay Overview with color-coded occupancy and lock statuses.
   - Physical count adjustment workflow with mandatory justification and double-entry movement logging.

3. **Rule 14-B FIFO Allocation Engine**
   - Deterministic chronological liquidation: `intake_date ASC` → `intake_timestamp ASC` → `batch_id ASC`.
   - Automated multi-batch splitting across stack candidates.
   - Automatic exclusion of batches flagged as `QUALITY_HOLD`, `AWAITING_INSPECTION`, or `DEPLETED`.
   - Rejection of zero and negative demands with clear shortage/deficit tallies.
   - Operator FIFO Exception toggle triggering statutory audit warnings and dual-sign-off workflows.

4. **Stock Inward & Consignment Intake**
   - 4-stage gate workflow: Consignment & Truck Details → Moisture & Sampling → Weighbridge & Stacking → Bahi Ledger Posting.
   - Electronic weighbridge gross/tare/net weighment reconciliation with transit variance tolerance monitoring (≤0.5%).
   - Shed 04 intake bay matrix and sampling protocol acknowledgment.
   - Offline draft caching in local IndexedDB with background re-sync on reconnection.

5. **Quality Inspection & Lab Queue**
   - Refraction testing and digital laboratory custody chains.
   - Quality hold locking preventing grain dispatches.
   - Re-test clearance workflow transitioning batches to eligible status.

6. **Delivery Challans & Gate Outward Passes**
   - Official PDS Foodgrain Delivery Challan generator formatted for printing and PDF generation.
   - SHA-256 cryptographic security hash and verification QR code.
   - Atomic two-stage gate exit: Challan generation reserves stock; confirmation of weighbridge gate departure physically deducts stock from batches and appends immutable debit ledger entries.

7. **FIFO Exceptions & Dual-Sign-Off Board**
   - Statutory governance for operator bypass requests.
   - Approval/rejection interface requiring Godown Manager or District Supply Officer (DSO) authority.
   - Full audit trail recording approver badge numbers, timestamps, and justification notes.

8. **Double-Entry Stock Movement Ledger**
   - Immutable historical record of inward credits (+), outward dispatch debits (-), quality locks, and physical count adjustments.
   - Authoritative running balance column.
   - Built-in CSV export and print statement functionality.

9. **Statutory Reports & Registers**
   - Batch-Wise Stock Register, Commodity Stock Balance Statement, Grain Ageing & Liquidation Alert Report (>60 days), and FPS Distribution Statement.
   - Client-side CSV export engine for departmental reporting.

10. **System Audit Trail & Security Ledger**
    - SHA-256 chained log of logins, role switches, weighbridge events, and approvals.

11. **PWA & Offline Resilience**
    - Service Worker and Web Manifest for installable PWA experience.
    - Seamless toggle between Online and Offline modes.

---

## 🎨 Design System & Visual Aesthetics

The UI adheres strictly to the official **Stitch Design System** guidelines:
- **Color Palette:**
  - Primary (Forest Green): `#053727` / `#214e3d`
  - Secondary (Muted Grain Gold): `#7e5717` / `#fec87e`
  - Background (Warm Ivory / Surface): `#f3fbf5` / `#f6f5f0`
  - Warning Amber: `#9b641b` / `#fef3c7`
  - Error Red: `#ba1a1a` / `#ffdad6`
- **Typography:**
  - UI & Headings: `IBM Plex Sans`
  - Numbers, Balances & Cryptographic Hashes: `JetBrains Mono`
  - Icons: `Material Symbols Outlined`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer recommended, tested on Node v24.16.0)
- npm (v9 or newer, tested on npm 11.13.0)

### 1. Installation
Clone the repository and install dependencies:
```bash
cd BhandaarSetu
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```
*Note: The application operates independently in high-fidelity local demonstration mode without requiring external paid SaaS services.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suites
Execute the Vitest test suites (14 tests covering FIFO math, multi-batch splitting, quality exclusion, gate outward deduction, and exception workflows):
```bash
npx vitest run
```

### 5. Production Build & Typecheck
Compile the TypeScript code and generate the optimized Vite production bundle:
```bash
npm run build
```

---

## 👥 Role-Based Access Personas

Use the **Role Switcher** in the top header bar to simulate different administrative roles:

| Persona | Role | Key Permissions |
| :--- | :--- | :--- |
| **R. Sharma** (DL-FCS-4491) | `GODOWN_MANAGER` | Full floor operations, inward verification, exception sign-off, gate dispatch confirmation. |
| **A. K. Mathur** (DL-DSO-0104) | `DISTRICT_SUPPLY_OFFICER` | High-tier approval authority, district audit finalization, Rule 14-B override review. |
| **Inspector Verma** (DL-QC-8812) | `QUALITY_INSPECTOR` | Moisture inspection, NABL lab sampling, imposing and releasing quality holds. |
| **P. Rawat** (DL-OPS-3301) | `STOCK_INWARD_OPERATOR` | Gate pass generation, gross/tare weighbridge recording, draft consignment entry. |
| **M. Singh** (DL-DISP-2219) | `DISPATCH_OPERATOR` | FPS allocation requisitions, FIFO calculation runs, challan drafting. |
| **S. Chawla** (DL-AUD-9901) | `AUDITOR` | Read-only ledger inspection, physical stock discrepancy checks, export access. |

---

## 📂 Project Structure

```
BhandaarSetu/
├── public/
│   ├── favicon.svg             # Branded Grain Icon
│   └── manifest.json           # PWA Web Manifest
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── PrintChallanModal.tsx  # Printable PDS Delivery Challan
│   │   │   └── Toast.tsx              # System Notification Banner
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Responsive Application Shell
│   │   │   ├── Header.tsx             # Header with Role Switcher & Live Search
│   │   │   └── Sidebar.tsx            # Navigation Sidebar matching Stitch design
│   │   └── views/
│   │       ├── DashboardView.tsx          # Godown Overview & Daily Balance
│   │       ├── InventoryBatchView.tsx     # Batch Register & Physical Bay Map
│   │       ├── FIFOAllocationView.tsx     # Rule 14-B Allocation Engine
│   │       ├── StockInwardView.tsx        # Consignment Intake & Weighbridge
│   │       ├── QualityInspectionView.tsx  # Refraction Lab & Moisture Testing
│   │       ├── DeliveryChallansView.tsx   # Challans & Gate Outward Exit
│   │       ├── FIFOExceptionsView.tsx     # Dual-Sign-Off Exception Review Board
│   │       ├── StockLedgerView.tsx        # Double-Entry Running Balance Ledger
│   │       ├── ReportsView.tsx            # Statutory Registers & CSV Export
│   │       ├── AuditTrailView.tsx         # Security Event Log & SHA-256 Hashes
│   │       └── SettingsView.tsx           # Depot Parameters & Demo Reset
│   ├── context/
│   │   └── AppContext.tsx             # State Management & Role Persona Context
│   ├── services/
│   │   ├── fifoEngine.ts              # Deterministic Rule 14-B Math & Tie-Breaker
│   │   └── storage.ts                 # Storage Service with Demo Data
│   ├── types/
│   │   └── index.ts                   # Complete Domain TypeScript Definitions
│   ├── App.tsx                        # Root App Component
│   ├── index.css                      # Tailwind Base + Print Styles + Tabular Numbers
│   └── main.tsx                       # React DOM Entrypoint
├── tests/
│   ├── fifo.test.ts                   # 8 Vitest Unit Tests for Rule 14-B Engine
│   └── workflow.test.ts               # 6 Vitest Workflow & Integrity Tests
├── stitch_anajbahi_.../               # Original Stitch UI Reference (Untouched)
├── projectidea.md                     # Comprehensive 35-Section Specification
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📜 Compliance & Legal Disclaimer

*BhandarSetu — भंडारसेतु* is an independent software prototype developed for hackathon demonstration, designed in accordance with published Public Distribution System (PDS) operational guidelines, National Food Security Act (NFSA) Section 12(2), and Warehousing Development and Regulatory Authority (WDRA) best practices. It does not represent an official government portal.
