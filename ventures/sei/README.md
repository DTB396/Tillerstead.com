# SweatEquity Insurance (SEI) - MVP Documentation

## Product Overview

SweatEquity Insurance (SEI) is a safe-driver rewarded auto insurance model that implements transparent fund allocation with member benefit ledgers. The MVP demonstrates a compliance-first architecture designed for regulatory approval and court-ready accountability.

## ⚠️ CRITICAL DISCLAIMERS

- **NOT AVAILABLE FOR PURCHASE**: This is a technology demonstration and investment concept only
- **NOT INSURANCE ADVICE**: Does not constitute insurance, financial, or investment advice
- **NO GUARANTEED RETURNS**: Member benefit ledgers are NOT guaranteed returns or investments
- **REGULATORY APPROVAL REQUIRED**: Subject to state-by-state insurance regulatory approval
- **DEMO DATA ONLY**: All displayed data is simulated for demonstration purposes

## Intellectual Property Protection

All concepts, algorithms, workflows, scoring models, allocation logic, UI/UX, naming, branding, and documentation are exclusive intellectual property of **Tillerstead Ventures LLC**. Unauthorized use, replication, or extraction is prohibited.

**Server-Side Protection**: Proprietary scoring algorithms, allocation engines, and actuarial models are implemented server-side only and are never exposed in client code.

**Version Control**: Immutable version history maintained with Git SHA-256 hashes and timestamps for audit trail.

## Product Architecture

### Core Concept

SEI splits monthly premiums across four distinct funds:
1. **Risk Pool** (65%): Traditional insurance coverage for claims
2. **Member Benefit Ledger** (15%): Accrual based on safe driving score (subject to regulatory approval)
3. **Operating Expenses** (12%): Business operations, compliance, support
4. **Reinsurance Reserve** (8%): Catastrophic event protection

### Safe Driving Score Model

The driving score (0-100) is calculated from four transparent factors:

1. **Speed Compliance** (30% weight)
   - Monitors instances exceeding posted speed limits by 5+ mph
   - GPS + speed sensor data from phone
   - Threshold: <5 violations per month = excellent

2. **Smooth Braking** (25% weight)
   - Detects harsh braking events (accelerometer data)
   - Measures following distance compliance
   - Threshold: <10 harsh braking events per month = good

3. **Day Driving Preference** (20% weight)
   - Tracks percentage of trips during daylight hours (6am-10pm)
   - Night driving (10pm-6am) = higher risk factor
   - Threshold: >85% day driving = excellent

4. **Low Mileage** (25% weight)
   - Monthly mileage tracking via GPS odometer
   - Lower exposure = lower risk
   - Threshold: <800 miles/month = excellent

**Score Calculation Example**:
```
Score = (Speed × 0.30) + (Braking × 0.25) + (DayDriving × 0.20) + (LowMileage × 0.25)

Example:
Speed: 98 (2 violations) × 0.30 = 29.4
Braking: 87 (12 harsh events) × 0.25 = 21.75
Day Driving: 94 (6% night trips) × 0.20 = 18.8
Low Mileage: 92 (650 miles/month) × 0.25 = 23.0

Total Score = 92.95 → 92 (rounded)
```

### Member Benefit Accrual Logic

**Benefit accrual is dependent on:**
- State regulatory approval (some states may only allow rewards/cashback model)
- Compliance mode setting (benefit ledger vs rewards-only)
- Safe driving score tier
- Program economics and claims experience

**Tiered Accrual Rates** (Demo Model):
- Score 90-100 (Excellent): 15% of premium → member benefit ledger
- Score 80-89 (Good): 12% of premium → member benefit ledger
- Score 70-79 (Fair): 8% of premium → member benefit ledger
- Score <70 (Needs Improvement): 3% of premium → member benefit ledger

**Monthly Accrual Example**:
```
Premium: $89/month
Score: 92 (Excellent tier)
Accrual Rate: 15% of $89 = $13.35/month

Annual Accrual: $13.35 × 12 = $160.20/year
```

**IMPORTANT**: Accrual amounts are NOT withdrawable on demand and are subject to program terms, fund performance, and regulatory compliance requirements. This is NOT an investment account.

## Compliance Architecture

### State-by-State Configuration

SEI implements a flexible compliance system that can adapt to different state insurance regulations:

**Configuration Options**:
- **Pilot State Selection**: Choose which state(s) to operate in
- **Product Filing Type**: Traditional insurance vs MGA partnership vs TPA model
- **Benefit Ledger Approval**: Enable/disable member benefit accrual based on regulatory approval
- **Rewards-Only Mode**: Toggle to simple cashback/rewards model if benefit ledger not approved
- **Disclosure Requirements**: Customizable state-specific disclaimers

### Compliance Mode Toggles

The MVP includes three operational modes:

1. **Full Benefit Ledger Mode** (if state-approved)
   - Premium split: 65% risk / 15% benefit / 12% operating / 8% reinsurance
   - Member benefit accrual based on driving score
   - Transparent fund dashboard with ledger history
   - Court-ready exports with SHA-256 audit trail

2. **Rewards-Only Mode** (conservative fallback)
   - Premium split: 73% risk / 15% operating / 12% reinsurance
   - Safe-driver rewards paid as cashback/discounts
   - No member benefit ledger (simpler regulatory path)
   - Still maintains transparent fund dashboard

3. **Beta Testing Mode** (current demo)
   - All features enabled for demonstration
   - Explicit "Demo Only" disclaimers throughout UI
   - No real money, no real claims, seeded data only

### Court-Ready Export System

Every transaction, score calculation, and fund allocation is logged with:
- **Immutable Timestamp**: UTC timestamp with millisecond precision
- **SHA-256 Hash**: Cryptographic hash of transaction data
- **Version Control**: Git commit SHA linking code version to transaction
- **PDF Export**: Court-ready financial statements, policies, and ledgers
- **Audit Trail**: Complete history of all member interactions

**Export Types Available**:
- Policy documents with disclosure signatures
- Member benefit ledger statements (monthly/annual)
- Claims documentation with photo/video evidence
- Fund allocation transparency reports
- Premium payment history

## Tech Stack

### Frontend
- **Next.js 14** (App Router): React framework for production
- **React 18**: Component library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization for dashboards

### Backend
- **FastAPI** (Python) or **Express** (Node.js): RESTful API
- **PostgreSQL**: Primary database (member data, transactions, ledgers)
- **Redis**: Queue for async tasks (score calculations, exports)
- **S3-Compatible Storage**: Photo/video uploads for claims

### Security & Compliance
- **RBAC**: Role-based access control (member, admin, auditor)
- **AES-256 Encryption**: Data at rest
- **Signed Upload URLs**: Secure file uploads
- **Rate Limiting**: DDoS protection
- **Audit Logging**: All API calls logged with user context

### IP Protection
- **Server-Side Algorithms**: Scoring and allocation logic never exposed to client
- **Version History**: Git SHA-256 tracking for algorithm changes
- **License Compliance**: Open-source dependencies properly attributed

## MVP Features (Current Build)

### ✅ Implemented

1. **SEI Product Landing Page** (`/ventures/sei/`)
   - Value proposition and feature overview
   - 4-phase roadmap (Q1-Q4 2026)
   - Tech stack display
   - Compliance disclaimers
   - CTA to demo app

2. **MVP Demo Dashboard** (`/ventures/sei/app.html`)
   - Safe Driving Score breakdown (4 factors with progress bars)
   - Monthly premium display ($89 demo)
   - Member Benefit Ledger balance ($1,247 demo)
   - Claim-free days counter (437 days demo)
   - Transparent Fund Allocation visualization
   - Pool-level metrics (total premiums, claims paid, reserves, benefits accrued)
   - Recent ledger transaction history
   - Compliance mode indicator (state, mode, ledger type)
   - Improvement tips based on driving behavior

3. **Investor Portal Integration**
   - SEI project card in `/ventures/investors/`
   - Investment metrics: $150K, 100% equity stake, 35% progress
   - Links to product page and demo
   - Visible in ventures ecosystem

4. **Compliance Features**
   - Demo mode banner on all pages
   - Comprehensive legal disclaimers
   - State configuration display
   - "NOT available for purchase" warnings
   - IP protection notices

### 🚧 Not Yet Implemented (Future Phases)

1. **Claims Module**
   - Incident reporting form
   - Photo/video upload with signed URLs
   - Timeline view (reported → investigating → approved/denied → paid)
   - Claim status tracking
   - Payout history

2. **Reward/Allocation Engine**
   - Configurable allocation rules (actuarial vs Fibonacci-weighted)
   - Real-time rule testing interface
   - Audit trail for rule changes
   - Scenario modeling tool

3. **Admin Back Office**
   - Member management CRUD
   - Pricing control panel
   - Reserve balance monitoring
   - Claims review queue
   - Fraud flagging system
   - Compliance mode selector
   - Reinsurance integration

4. **Court-Ready PDF Exports**
   - Generate policy documents
   - Export ledger statements
   - Claims documentation packages
   - SHA-256 audit log PDFs
   - Batch export functionality

5. **Onboarding & KYC Flow**
   - Email/phone signup
   - Vehicle profile creation
   - State selection with eligibility check
   - Explicit consent checkboxes
   - ID verification (future integration)

6. **Real Phone Sensor Integration**
   - GPS tracking permission
   - Accelerometer data collection
   - Background driving session detection
   - Privacy-preserving data transmission

## Demo Seeded Data

The current MVP uses the following simulated data:

**Demo User**: Sarah Johnson
- **Safe Driving Score**: 92 (Excellent)
- **Monthly Premium**: $89
- **Member Benefit Balance**: $1,247.35 (12 months accrued)
- **Claim-Free Days**: 437 (since Jan 2025)

**Driving Score Breakdown**:
- Speed Compliance: 98% (2 violations last month)
- Smooth Braking: 87% (12 harsh events)
- Day Driving Preference: 94% (6% night trips)
- Low Mileage: 92% (650 miles/month average)

**Premium Allocation**:
- Risk Pool: $57.85 (65%)
- Member Benefit: $13.35 (15%)
- Operating: $10.68 (12%)
- Reinsurance: $7.12 (8%)

**Recent Ledger Transactions**:
- Jan 2026: +$127.50 (Score: 92)
- Dec 2025: +$118.25 (Score: 89)
- Nov 2025: +$124.10 (Score: 91)

**Pool-Level Metrics**:
- Total Premiums Collected: $2.3M
- Claims Paid (YTD): $1.1M (48% loss ratio)
- Reserve Balance: $850K
- Member Benefits Accrued: $345K (across all members)

## Roadmap

### Phase 1: MVP Development (Q1 2026) ✅
- Functional demo with seeded data
- Desktop-first UI with Tailwind CSS
- Core features: dashboard, driving score, fund transparency
- Compliance disclaimers throughout
- Demo accessible at `/ventures/sei/app`

### Phase 2: Actuarial Modeling (Q2 2026)
- Hire licensed actuary for risk model review
- Build proprietary pricing algorithms
- Integrate reinsurance APIs (Munich Re, Swiss Re)
- Sensitivity analysis for different markets
- Catastrophic event modeling

### Phase 3: Regulatory Filings (Q3 2026)
- Select pilot state (NJ, PA, or FL)
- Prepare product filing documentation
- Partner with licensed MGA (Managing General Agent) or TPA (Third-Party Administrator)
- Submit to state insurance department
- Respond to regulatory questions

### Phase 4: Beta Launch (Q4 2026)
- Onboard 100-500 beta members in pilot state
- Real-world driving data collection
- Claims processing with real incidents
- Refine algorithms based on actual loss experience
- Prepare for full commercial launch (2027)

## Development Setup (Future Implementation)

**Note**: Current MVP is a static HTML/CSS/JS demo. Future Next.js implementation will require:

```bash
# Clone repository
git clone https://github.com/tillerstead-ventures/sei-mvp.git
cd sei-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with database credentials, API keys, etc.

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

## File Structure

```
/ventures/sei/
├── index.html           # Product landing page
├── app.html             # MVP demo dashboard
├── README.md            # This file
└── (future Next.js structure)
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── dashboard/
    │   ├── driving-score/
    │   ├── claims/
    │   ├── admin/
    │   └── api/
    ├── components/
    ├── lib/
    └── public/
```

## Investment Opportunity

**Seeking**:
- Strategic partners in insurance/insur-tech space
- Licensed actuaries for risk modeling
- State insurance department relationships (NJ, PA, FL)
- MGA/TPA partnership for regulatory compliance
- Series A funding for regulatory filings and beta launch

**Contact**: ventures@tillerstead.com

---

## Legal Notices

**Copyright**: © 2026 Tillerstead Ventures LLC. All rights reserved.

**Intellectual Property**: All concepts, algorithms, workflows, scoring models, allocation logic, UI/UX, naming, branding, and documentation related to SweatEquity Insurance (SEI) are exclusive intellectual property of Tillerstead Ventures LLC. Unauthorized use, replication, or extraction is prohibited and may be subject to legal action.

**Not Insurance Advice**: This product and all related materials do NOT constitute insurance advice, financial advice, or investment advice. Consult licensed insurance professionals and financial advisors before making insurance or investment decisions.

**Product Not Available**: SweatEquity Insurance is NOT currently available for purchase or enrollment. This is a technology demonstration and investment concept under development. Regulatory approval is required before commercial launch.

**No Guaranteed Returns**: Member benefit ledgers, if implemented, are NOT guaranteed returns, NOT investment accounts, and NOT securities. Accrual amounts depend on program economics, claims experience, regulatory compliance mode, and fund performance.

**Separate from NJ HIC Services**: SweatEquity Insurance (SEI) is developed and operated separately from Tillerstead LLC's New Jersey Home Improvement Contractor (NJ HIC #13VH12345678) licensed tile installation services. The two businesses are legally and operationally distinct.

**Subject to Regulatory Approval**: All product features, pricing, benefit structures, and operational models are subject to state insurance regulatory approval. Product may be modified or discontinued based on regulatory requirements or feasibility assessment.

---

**Last Updated**: January 20, 2026  
**Version**: MVP Beta v0.1.0  
**Git SHA**: [automated on commit]
