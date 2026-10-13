# Marshal College ERP & Connected Learner Portal

> **Integrated Higher Education Enterprise Platform**: Bringing together the Staff-Facing Administration ERP (`pceterpin`) and the Student-Facing Learner Portal (`student rp`) into one unified, real-time, database-backed platform.

---

## 🌟 Key Features & Architectural Innovations

### 1. Dual Connected Portals with One Authoritative Database
- **Staff-Facing ERP (`/staff`)**:
  - Super Admin, Principal, Examination Controller, HOD, Faculty, Accounts, and Transport Incharge.
  - Interactive Lecture Attendance Roll Call with one-click bulk status toggles.
  - Faculty Assessment Marks Entry with maximum mark bounds validation.
  - Controller of Examinations Result Processing Room: Executes automated UGC/AICTE 10-point SGPA/CGPA evaluation and publishes marksheets.
  - Fee collection counter with official receipts.
  - Digital transport routes & bus pass management.
- **Learner Student Portal (`/learner`)**:
  - Direct reuse and enhancement of the EduPlusCampus student portal design.
  - **Live Official Marksheet**: Displays autonomous grade card with watermark, course-wise credits, letter grades, SGPA (8.89), CGPA (8.78), and anti-tamper barcode.
  - My Attendance gauge with conducted vs attended lecture breakdown and shortage warnings (<75%).
  - Printable Examination Hall Ticket / Admit Card.
  - Fee ledger with remaining dues and printable 3-copy receipts.
  - Digital bus pass with allocated stop and vehicle details.

### 2. Real-Time Live Marksheet & User Monitor
- When students open their Grade Card on the Learner Portal, the WebSocket hub registers their presence.
- The Staff ERP dashboard features a dedicated **Live Monitor Room** displaying real-time active student viewers, their PRN, name, and examined semester with a pulsing radar indicator.
- When results are published by the Controller, a real-time broadcast instantly refreshes student screens.

### 3. Edge-Ready with Cloudflare D1 & KV
- Compatible with SQLite for local development and Cloudflare D1 for edge deployment.
- Cloudflare KV caching layer for unlimited edge bandwidth and instantaneous retrieval of student marksheets and profiles.

---

## 📂 Project Architecture

```
MarshalERP/
├── server/                     # Authoritative Express + WebSocket API Server
│   ├── db/                     # SQLite / Cloudflare D1 Schema & Seed Script
│   ├── middleware/             # JWT Auth, RBAC & Student Isolation Guard
│   ├── routes/                 # REST Endpoints (Auth, Attendance, Exams, Fees, Transport)
│   ├── services/               # Official Grading Engine & WebSocket Hub
│   └── tests/                  # Automated Verification Test Suite
├── client/                     # Unified Dual-Portal Frontend (Vite + React + Tailwind)
│   ├── src/
│   │   ├── erp/                # Staff ERP Pages & Components
│   │   ├── learner/            # Student Learner Pages & Components
│   │   ├── context/            # AuthContext & WebSocketContext (Live Engine)
│   │   └── pages/              # Portal Landing Hub
├── cloudflare/                 # Cloudflare Wrangler Configuration (D1 & KV)
├── CODEBASE_AUDIT_ERP.md       # Audit of Source Project A (Staff ERP)
├── CODEBASE_AUDIT_LEARNER.md   # Audit of Source Project B (Learner Portal)
├── EXISTING_FEATURE_INVENTORY.md# Complete cross-referenced feature inventory
├── ERP_IMPLEMENTATION_PLAN.md  # System Architecture Roadmap
├── DATABASE_DESIGN.md          # Relational Schema & KV specifications
├── ROLE_PERMISSION_MATRIX.md   # Role-based access control matrix
├── MODULE_ROUTE_MAP.md         # Full URL and endpoint mapping
├── LEARNER_ERP_INTEGRATION.md  # Real-time synchronization architecture
├── MARKS_GRADING_RULES.md      # Statutory 10-point SGPA/CGPA evaluation rules
├── ERP_QA_REPORT.md            # Verified test runner results
└── DEPLOYMENT_GUIDE.md         # Cloudflare 2-site deployment guide
```

---

## 🚀 Quick Start Guide

### 1. Initialize & Seed Database
```bash
cd server
npm install
npm run seed     # Populates college, faculty, courses, and student Darshan Dalvi (121B1G148)
npm run test     # Runs academic calculation test suite
npm run dev      # Starts API on http://localhost:5000 and ws://localhost:5000/api/ws/live
```

### 2. Launch Dual-Portal Frontend
```bash
cd client
npm install
npm run dev      # Starts frontend on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Default Demonstration Credentials

| Role | Username / PRN | Password | Portal URL |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | `/staff/login` |
| **Exam Controller** | `examcontroller` | `exam123` | `/staff/login` |
| **Faculty Member** | `faculty1` | `faculty123` | `/staff/login` |
| **Accounts Officer**| `accounts` | `accounts123` | `/staff/login` |
| **Student (Learner)**| **`121B1G148`** | **`student123`** | **`/learner/login`** |
