# BrightThanks — Enterprise Employee Recognition & Rewards Platform

BrightThanks is a full-stack, enterprise-grade recognition and rewards management system built with **Laravel 11**, **Sanctum**, **PostgreSQL/Supabase**, and a reactive **React 19 / Vite** frontend styled with Tailwind CSS v4 and animated using Motion (Framer Motion).

---

## 🎯 Architecture & Highlights

- **Enterprise Role-Based Access Control (RBAC)**: Administrators, Managers, and Employees with granular abilities.
- **Double-Entry & Pessimistic Wallet Locking**: Every point awarded, converted from SGD, redeemed, or revoked is strictly tracked with immutable ledger entries, versioned wallets, and database-level locking (`lockForUpdate()`) to prevent race conditions or overspending.
- **100+ Fictional Singapore Merchants & Rewards**: Seeded catalogue across 20 Singapore estates with search and category filters.
- **AI-Powered Suggestions with Manual Fallback**: Generative message suggestions powered by Google Gemini API, with robust offline/unconfigured fallback.
- **Chart.js System Analytics & CSV Audits**: Real-time program velocity charts, employee liability tables, personal CSV statements, and global system audit exports.
- **Automated Milestone Awards**: Background console command for automated birthday and scaled work-anniversary points.

---

## 👥 Demo Accounts (Credentials)

All demo accounts share the password: `password`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | Full system control: Reference data, employee administration, analytics & CSV audit export, all recognitions. |
| **Manager** | `manager@example.com` | Award direct reports, suggest messages, review appreciation board, browse rewards. |
| **Employee** | `employee@example.com` | View appreciation board, available points, browse 100+ merchant vouchers, redeem rewards, download personal CSV statements. |

---

## 🚀 Getting Started

### 1. Backend Setup (Laravel)
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

Run the full automated test suite (Pint + PHPStan + Pest):
```bash
composer test
```

Build the frontend client:
```bash
cd frontend
npm run lint
npm run build
```

---

## ⚙️ Environment Variables (.env)
Key environment variables to configure:
- `FRONTEND_URLS`: Comma-separated list of allowed frontend origins for CORS (e.g. `http://localhost:5173,https://your-domain.com`).
- `SANCTUM_STATEFUL_DOMAINS`: Allowed stateful domains for session cookies (e.g. `localhost:5173,127.0.0.1:5173`).
- `SESSION_DOMAIN`: Session cookie domain (leave empty or null for local dev).
- `GEMINI_API_KEY`: Google Gemini API key for AI-assisted appreciation message drafting.
- `REWARDS_POINTS_PER_SGD`: Point conversion rate (default: `10`).

---

## 🏆 User Stories Implemented (BT-01 through BT-19)
- **BT-01**: Hosting, deployment, and cloud connectivity health check.
- **BT-02**: Migrations, relationships, roles, occasions, values, and security boundaries.
- **BT-03**: Sanctum session authentication, policies, role-based navigation.
- **BT-04**: Employee lifecycle administration (create, update, deactivate, reactivate).
- **BT-05**: Occasions and company values management (create, update, deactivate, delete).
- **BT-06**: Occasion & ad-hoc awards with SGD conversion and Gemini message suggestions.
- **BT-07**: Transactions, pessimistic locking, ledger reconciliation, and idempotency keys.
- **BT-08**: Appreciation board with company pulse pagination and instant revocation.
- **BT-09**: Seed 100 fictional Singapore merchants and rewards with search and pagination.
- **BT-10**: Pessimistic redemption transactions with stock management and mock reference codes.
- **BT-11**: Rewards catalogue and redemption history interface.
- **BT-12**: Comprehensive concurrency, duplicate request, and insufficient balance test suite.
- **BT-13**: Gemini message generation with fallback and customizability.
- **BT-14**: Personal employee analytics dashboard and statement CSV export.
- **BT-15**: Admin analytics totals, 7-day Chart.js trend velocity, balance liability table, and system audit CSV export.
- **BT-16**: Role, concurrency, ledger reconciliation, and end-to-end full-flow tests.
- **BT-17**: Deployment readiness, CORS/env configurations, demo accounts, and pitch-ready release freeze.
- **BT-19**: Automated birthday and work anniversary milestone awards (`rewards:process-milestones`).
