# SuburbSense — Feature Audit & Roadmap

> Last updated: 2026-08-22
> Status: Active development

---

## Vision

SuburbSense is a free, data-first Australian suburb intelligence and utility comparison platform. Built entirely from public government data (ABS Census, ACARA, GTFS transit, AER CDR, State Revenue Offices). No paid/NPG property data. Monetised via utility comparison affiliate links (CIMET model).

---

## Phase 1: Foundation Calculators (Migrate from realestate app)

### 1.1 Stamp Duty Calculator
- **Source**: `realestate/src/data/suburbs.ts` (lines 196-292) + `backend/main.py` (lines 1748-1810)
- **Inputs**: Property price, state (all 8), FHB status, property type (established/new/vacant)
- **Outputs**: Duty amount, mortgage reg fee, transfer fee, total government fees, FHOG amount
- **Data**: Hardcoded state rate tables (public info from State Revenue Offices)
- **Backend**: `backend/app/calculators.py` — `POST /api/calculators/stamp-duty`
- **Frontend**: `frontend/src/pages/StampDutyCalculator.jsx` — `/calculators/stamp-duty`
- **Status**: ✅ Implemented

### 1.2 Loan Repayment Calculator
- **Source**: `realestate/src/components/Calculators.tsx` (lines 33-38)
- **Inputs**: Loan amount, interest rate (%), loan term (years)
- **Outputs**: Monthly repayment, total interest
- **Backend**: `backend/app/calculators.py` — `POST /api/calculators/loan-repayment`
- **Frontend**: Accessible via calculators hub
- **Status**: ✅ Implemented

### 1.3 Borrowing Power Calculator
- **Source**: `realestate/src/components/Calculators.tsx` (lines 40-46)
- **Inputs**: Annual income, annual expenses
- **Outputs**: Estimated borrowing power (6.5% stress rate, 30% income-to-payment ratio)
- **Backend**: `backend/app/calculators.py` — `POST /api/calculators/borrowing-power`
- **Status**: ✅ Implemented

### 1.4 Affordability / Price Ceiling Calculator
- **Source**: `realestate/src/data/suburbs.ts` (lines 294-388) + `AffordabilityCalculator.tsx`
- **Inputs**: Deposit, LVR, combined income, monthly debt, interest rate, serviceability buffer, FHB status
- **Outputs**: Per-state max price, max borrowing, stamp duty, LMI, FHBG eligibility, limiting factor
- **Backend**: `backend/app/calculators.py` — `POST /api/calculators/affordability`
- **Frontend**: `frontend/src/pages/AffordabilityCalculator.jsx` — `/calculators/affordability`
- **Status**: ✅ Implemented

### 1.5 ROI / Cashflow Calculator
- **Source**: `realestate/src/components/QuickRoiCalculator.tsx` + `backend/main.py` (lines 1812-1889)
- **Inputs**: Purchase price, weekly rent, state, deposit %, interest rate, loan type, strata, rates, water, insurance, PM fee %, vacancy weeks, maintenance %, salary, depreciation
- **Outputs**: Net yield %, cash-on-cash return %, weekly cashflow, upfront costs, stamp duty
- **Backend**: `backend/app/calculators.py` — `POST /api/calculators/roi`
- **Frontend**: `frontend/src/pages/ROICalculator.jsx` — `/calculators/roi`
- **Status**: ✅ Implemented

### 1.6 Government Fees Calculator
- **Source**: `realestate/src/data/suburbs.ts` (lines 412-498)
- **Inputs**: Property price, state
- **Outputs**: Transfer fee, mortgage registration fee
- **Backend**: Included in stamp duty endpoint
- **Status**: ✅ Implemented

### 1.7 FHOG Calculator
- **Source**: `realestate/src/data/suburbs.ts` (lines 390-399)
- **Inputs**: State, property type, property value
- **Outputs**: FHOG amount + eligibility
- **Backend**: Included in stamp duty endpoint
- **Status**: ✅ Implemented

### 1.8 Land Tax Calculator (NEW — not in realestate)
- **Source**: State Revenue Office rates (all 8 states/territories)
- **Inputs**: State, land value, PPR status, foreign owner status
- **Outputs**: Annual land tax, foreign surcharge, monthly equivalent
- **Features**: Progressive rate tables for all states, PPR exemption, foreign owner surcharge
- **Backend**: `backend/app/property_tools.py` — `GET /api/land-tax/calculate`
- **Frontend**: `frontend/src/pages/LandTaxCalculator.jsx` — `/land-tax`
- **Status**: ✅ Implemented

### 1.9 Council Rates Estimator (NEW — not in realestate)
- **Source**: State-wide average rate-in-the-dollar multipliers
- **Inputs**: State, property value
- **Outputs**: Estimated annual council rates, waste charge, monthly equivalent
- **Features**: All 8 states with correct valuation basis (CIV, UV, GRV, AAV, etc.)
- **Backend**: `backend/app/property_tools.py` — `GET /api/council-rates/estimate`
- **Frontend**: `frontend/src/pages/CouncilRatesEstimator.jsx` — `/council-rates`
- **Status**: ✅ Implemented

---

## Phase 2: AER Energy Data Integration

### 2.1 AER CDR API Client
- **API**: `https://cdr.energymadeeasy.gov.au/{brand}/cds-au/v1/energy/plans`
- **Access**: Anonymous, no accreditation, no API key
- **Coverage**: VIC, NSW, QLD, SA, ACT, TAS (National Energy Customer Framework states)
- **Excluded**: WA, NT (not part of NECF)
- **Endpoints**:
  - `GET /energy/plans?type=ALL` — list all plans for a brand
  - `GET /energy/plans/{planId}` — full plan detail (tariffs, fees, discounts, solar feed-in)
- **Headers**: `x-v: 1` for plans list, `x-v: 3` for plan detail
- **Backend**: `backend/app/aer.py` — `sync_aer_rates()`, `fetch_aer_plans_list()`, `fetch_aer_plan_detail()`
- **Trigger**: `POST /api/aer/sync` (manual/admin)
- **Status**: ✅ Implemented

### 2.2 AER Data Sync Service
- Weekly background job to pull plan data from major retailers
- Upsert into `cached_energy_rates` table
- Covers: AGL, Origin, EnergyAustralia, Alinta, 1st Energy, Powershop, Engie, GloBird, OVO, Red Energy, Momentum, Sumo Power
- **Backend**: `backend/app/aer.py:sync_aer_rates(db, max_brands=3)`
- **Status**: ✅ Implemented (trigger via `POST /api/aer/sync`)

### 2.3 Enhanced Energy Comparison API
- `GET /api/rates/best` — already exists, will use AER-sourced data
- `GET /api/energy/compare?state=VIC&usage_kwh=5000` — compare plans by usage (NEW)
- **Backend**: `backend/app/scanners.py:compare_energy_plans()`
- **Frontend**: `frontend/src/pages/EnergyCompare.jsx` — `/energy/compare`
- **Status**: ✅ Implemented

### 2.4 Enhanced Bill Scanner
- Existing scanner extracts rates from bill photo
- Enhancement: match extracted rates against AER plan database
- Show user which plan they're likely on + cheaper alternatives
- **Status**: ⏳ Future (needs AER data populated first)

### 2.5 NBN Connection Lookup (NEW — not in realestate)
- **Source**: nbn™ official API via `nbnpy` Python package
- **Access**: Free, unofficial wrapper of public nbn API
- **Coverage**: All Australian addresses
- **Outputs**: Tech type (FTTP/FTTN/FTTB/FTTC/HFC/Fixed Wireless/Satellite), speed estimate, service status
- **Backend**: `backend/app/nbn_lookup.py` + `backend/app/nbn.py` — `GET /api/nbn/lookup`
- **Frontend**: `frontend/src/pages/NBNLookup.jsx` — `/nbn`
- **Status**: ✅ Implemented

### 2.6 First Home Guarantee Checker (NEW — not in realestate)
- **Source**: Housing Australia published price caps (effective 1 Oct 2025)
- **Access**: Free government data
- **Coverage**: All states/territories, all property types, single parents (FHG 2% deposit)
- **Outputs**: Eligibility, price cap, min deposit amount, LMI waived indicator
- **Backend**: `backend/app/nbn.py` — `GET /api/fhbg/check`
- **Frontend**: `frontend/src/pages/FHBAChecker.jsx` — `/fhbg`
- **Status**: ✅ Implemented

### 2.7 Land Tax Calculator (NEW — not in realestate)
- **Source**: State Revenue Office rates (all 8 states/territories)
- **Inputs**: State, land value, PPR status, foreign owner status
- **Outputs**: Annual land tax, foreign surcharge, monthly equivalent
- **Backend**: `backend/app/property_tools.py` — `GET /api/land-tax/calculate`
- **Frontend**: `frontend/src/pages/LandTaxCalculator.jsx` — `/land-tax`
- **Status**: ✅ Implemented

### 2.8 Council Rates Estimator (NEW — not in realestate)
- **Source**: State-wide average rate-in-the-dollar multipliers
- **Inputs**: State, property value
- **Outputs**: Estimated annual council rates, waste charge, monthly equivalent
- **Backend**: `backend/app/property_tools.py` — `GET /api/council-rates/estimate`
- **Frontend**: `frontend/src/pages/CouncilRatesEstimator.jsx` — `/council-rates`
- **Status**: ✅ Implemented

---

## Phase 3: Frontend Presentation Uplift

### 3.1 Design Principles (inspired by GoodSuburb)
- Clean, data-first layout
- Government data badges on every metric
- Clear attribution links
- No marketing spin — just numbers
- Mobile-first responsive
- Fast load times

### 3.2 New Pages
- `/calculators` — Hub page linking all calculators (linked from home page)
- `/calculators/stamp-duty` — Stamp duty + FHOG calculator ✅
- `/calculators/affordability` — How much can I borrow? ✅
- `/calculators/roi` — Investment property analysis ✅
- `/energy/compare` — Full energy plan comparison (AER data) ✅
- `/suburb/{slug}` — Enhanced profile with utility CTAs ✅ (existing)

### 3.3 Enhanced Components
- Data source attribution badges ✅ (on all calculator results)
- Score chips with government source labels ✅ (existing)
- Calculator result cards with breakdown charts ✅
- Affiliate disclosure banners (CIMET model) ⏳ (pending partner approval)
- **Status**: ✅ Implemented

---

## Phase 4: Revenue & Partnerships

### 4.1 CIMET Integration (when approved)
- Energy comparison: `connect.goodsuburb.com` model
- Internet comparison: `health.goodsuburb.com` model
- Health insurance comparison
- Commission per completed connection
- **Status**: ⏳ Awaiting partner approval

### 4.2 Lead Capture (interim)
- Email capture on calculator results
- "Get notified when comparison launches"
- Vertical: energy, internet, health
- **Status**: ✅ Already implemented (`/api/leads/`)

---

## Data Sources (All Free / Government)

| Source | Data | Update Frequency |
|--------|------|-----------------|
| ABS Census 2021 | Demographics, income, age, household | 5-yearly |
| ACARA 2025 | School ICSEA, enrolments, LBOTE | Annual |
| PTV GTFS | VIC transit stops/routes | Quarterly |
| TfNSW GTFS | NSW transit stops/routes | Quarterly |
| TransLink GTFS | QLD transit stops/routes | Quarterly |
| Adelaide Metro GTFS | SA transit stops/routes | Quarterly |
| Transperth GTFS | WA transit stops/routes | Quarterly |
| AER CDR API | Energy plan tariffs & fees | Real-time |
| State Revenue Offices | FHOG rules, stamp duty rates | As published |
| OpenStreetMap | Amenities, POIs | Continuous |
| Community | Grocery price observations | Continuous |

---

## Legal / Compliance Notes

- All data from public government sources (CC BY 4.0 compatible)
- No paid/NPG property data used (OnTheHouse, CoreLogic, etc.)
- Affiliate disclosure required on comparison pages
- "General information only" disclaimers on all tools
- No savings claims — only rate extraction + reference comparison
- AER data: public CDR endpoint, no accreditation required
- WA/NT excluded from AER energy comparison (not in NECF)

---

## Technical Debt / Notes

- Scrapers currently return hardcoded data — will be replaced by AER API
- AER reference prices in config are `None` — need to populate from DMO
- Frontend needs design uplift to match data-first positioning
- Consider adding numpy/pandas/sklearn for future risk engine migration
