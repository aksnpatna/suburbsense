# SuburbSense — Improvement Plan (Updated: 2026-08-24)

> Status: Live audit completed — calculators tested, UI improvements reviewed, legal gaps reassessed  
> Note: ABN, email aliases, and pre-launch admin items are acknowledged — intentionally deferred until go-live

---

## WHAT HAS BEEN IMPLEMENTED (Since Last Review)

### Suburb Profile — Significantly Improved
- **Composite score (suburb passport)** — composite 0-100 score at top of suburb profile ✅
- **Strengths & Trade-offs card** — auto-generated from data thresholds ✅
- **FAQ section with ld+json schema** — templated FAQ per suburb for SEO ✅
- **Helmet meta tags** — title and description on key pages ✅
- **Investment warning banner** — AFSL/ACL disclaimer on ROI calculator ✅
- **CalculatorsHub page** at `/calculators` — with all 10 tools listed ✅
- **CompareSuburbs page** at `/suburb/compare` ✅
- **Energy compare CTA on FHBG result** — revenue funnel connection ✅

### Still Missing / Not Yet Done
- Homepage hero still plain (no gradient, no visual)
- No social proof strip on homepage
- Nav still lists Land Tax as a top-level tab (not in a "More" dropdown)
- Calculator pages have no cross-links to other calculators
- No data freshness indicators on demographics sections (ABS 2021 notice)
- Mobile nav overflow not tested/fixed
- No `robots.txt` or `/sitemap.xml` generated
- Calculator result pages have no "What next?" CTA section

---

## PART A: CALCULATOR BUGS — CRITICAL (Fix Before Launch)

### BUG-1: VIC Land Tax Rates Are Wrong (property_tools.py)

**Severity: HIGH** — Users will see a number ~4x lower than reality

| Land Value | Our Result | Real SRO VIC 2024-25 | Error |
|-----------|-----------|----------------------|-------|
| $500,000 | $200/yr | ~$775/yr | 4x underestimate |
| $1,000,000 | $670/yr | ~$1,875/yr | 2.8x underestimate |

**Root cause**: Wrong thresholds and rates in `LAND_TAX["VIC"]` in `property_tools.py`

**Fix** — Replace VIC block with correct 2024-25 SRO rates:
```python
"VIC": {
    "thresholds": [0, 50000, 100000, 300000, 600000, 1000000, 1800000, 3000000],
    "rates":      [0, 0.002, 0.002,  0.002,  0.005,  0.010,   0.015,   0.022],
    "fixed":      [0, 0,     100,    575,    2075,   7075,    11075,   29075],
    "name": "VIC Land Tax 2024-25",
    "source": "SRO Victoria — sro.vic.gov.au",
},
```
> Verify against: https://www.sro.vic.gov.au/land-tax-calculator  
> Note: VIC also applies a 2% absentee owner surcharge and a 4% foreign purchaser surcharge — these are on top.

### BUG-2: Borrowing Power Uses Wrong Serviceability Rate

**Severity: HIGH** — Overestimates what users can borrow (compliance risk)

- **Current**: Uses `interestRate` directly (e.g. 6.2%)
- **Real APRA requirement**: Lenders must stress-test at `interestRate + 3.0%` (e.g. 9.2%)
- **Our output**: At $150k income, estimates $408k borrowing — realistic banks would say ~$350k
- **Fix** in `calculators.py` BorrowingPowerRequest handler:
```python
assessment_rate = req.interestRate + 3.0  # APRA 3% serviceability buffer
```

### BUG-3: ROI Calculator — Deposit Input UX Confusion

**Severity: MEDIUM** — Not a calculation bug but confuses users

- Frontend state: `depositPct = 0.2` (fraction)
- Slider label shows `0.2` not `20%`
- Users expect to enter `20` for 20% deposit

**Fix in ROICalculator.jsx**: 
- Change input to 0-100 range, divide by 100 before sending to API
- Label: "Deposit %" with value "20" (not 0.2)
- Or add helper text: "Enter as decimal e.g. 0.2 = 20%"

### BUG-4: NSW Land Tax Thresholds Slightly Outdated

**Severity: LOW** — Close but Revenue NSW updated thresholds in 2024

- Our threshold: $1,069,000 → correct threshold is $1,075,000 (2024-25)
- Small variance, acceptable with "verify with SRO" disclaimer

---

## PART B: CALCULATOR UX — NOT ORPHANED, BUT MISSING POLISH

### Status: Calculators ARE connected to the app
The calculators are NOT orphaned — the CalculatorsHub at `/calculators` lists all 10 tools, each page has its own route, and the nav links to them. The issue is:

1. **No back-navigation** between calculators — user finishes stamp duty and has to use browser back
2. **No cross-promotion** — after viewing stamp duty, no suggestion to check affordability
3. **No calculator results "next steps"** — FHBG returns next steps, others don't
4. **No "Try it for [Suburb]" entry point** — suburb profile has CTA cards but they don't pre-fill suburb data

### Fixes Needed Per Calculator

**Stamp Duty Calculator**
- [ ] Add "Also check: Affordability Calculator | FHBG Eligibility" at results bottom
- [ ] Show concession threshold context: "VIC FHB full exemption up to $600k, concession to $750k"
- [ ] Add data freshness: "Rates verified: [date] — Source: SRO [State]"
- [ ] Fix: `ABS data` attribution in footer is wrong — stamp duty is State Revenue Office only

**Affordability Calculator**
- [ ] Show monthly repayment prominently (currently not shown at all in results)
- [ ] Add "This assumes an 80% LVR — if using FHBG you can borrow up to 95%"
- [ ] Add link to Borrowing Power calculator for simpler version
- [ ] Show stamp duty in the results: "Don't forget: stamp duty adds ~$X to your upfront costs"
- [ ] Add: 30-year loan term assumption should be visible

**ROI Calculator**  
- [ ] Fix deposit input UX — enter as percentage (20) not fraction (0.2)
- [ ] Add "What does negative gearing mean?" expandable tooltip
- [ ] Show depreciation estimate (currently ignored even though field exists in data)
- [ ] Add "Gross yield vs Net yield" explanation
- [ ] Results: show "Above/below typical 4-6% gross yield" benchmark

**Borrowing Power Calculator** (/calculators has it but there's no dedicated page — it's embedded in FHBG logic)
- [ ] Create standalone Borrowing Power page — many users search for this
- [ ] Fix: apply 3% APRA buffer (see BUG-2)
- [ ] Add income input slider ($50k-$400k)
- [ ] Link to Affordability calculator for full picture

**Land Tax Calculator**
- [ ] Fix VIC rates (BUG-1)
- [ ] Add: "land tax is NOT paid on your primary home — only investment properties"
- [ ] Add: land tax threshold reminder per state ("Below $300k = $0 in VIC")
- [ ] Add prominent "What is land value?" explainer (many users confuse it with property value)

**Council Rates Estimator**
- [ ] Add prominent disclaimer: "Wide variation by council — this is state-wide average only"
- [ ] Show range (min-max) not just average: "Typical VIC range: $1,200–$3,800/yr"
- [ ] Add: "Your council's actual rate-in-the-dollar is on your rates notice"
- [ ] Add: link to council rate lookup resources

**FHBG Checker** (working well)
- [ ] Add combined output: "If eligible, your minimum deposit is $X — saving ~$Y in LMI"
- [ ] Add "Scheme history" note: "This scheme has unlimited places since Oct 2025"
- [ ] Connect to Stamp Duty: "With $X price in VIC, your stamp duty would be $Y"

**NBN Lookup**  
- [ ] Add explanation of tech types (FTTP vs HFC vs FTTN) — most users don't know what they mean
- [ ] Add: "Typical speeds available" per tech type
- [ ] Add: "Current NBN providers in your area" (pre-filter comparison)

---

## PART C: UI IMPROVEMENTS — STILL NEEDED

### Homepage

**Not yet done:**

**H-1: Hero Visual**  
The hero is still a plain white/blue section with text. No gradient, no illustration.  
Add a subtle radial gradient background or a stylised suburb skyline SVG.
```css
.hero {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f5f0ff 100%);
}
```

**H-2: Social Proof Strip**  
Missing. Add below the search box:
```html
<div class="proof-strip">
  <span>11,599 suburbs</span> · <span>ABS Census 2021</span> · 
  <span>ACARA 2025</span> · <span>6 states transit data</span> · 
  <span>Free · No login</span>
</div>
```

**H-3: Feature Cards Should Read as Use Cases**  
Current: "School Catchments" / "Transit Access" / "Census Demographics"  
Better: "Which school zone am I in?" / "How long will my commute be?" / "Who lives in this suburb?"

**H-4: "Compare Energy" Button Visual Weight**  
The revenue action button is undersized — it's the same visual weight as the other nav items.  
Make it gradient, add ⚡ icon, bump size to stand out.

**H-5: Calculator Cards on Homepage Should Show a "Try It Now" hook**  
Currently they navigate away. Consider an inline mini-calc for stamp duty in the hero:  
"Estimate stamp duty for any price → [price input] [state select] [Calculate]"

### Suburb Profile Page — Additional Gaps

**S-1: Template Summary Paragraph**  
The auto-generated summary paragraph is NOT yet implemented. The suburb profile goes straight from the passport scorecard into score chips, with no narrative text.  
Implement a 2-3 sentence generated summary using existing data fields (see template below):
```
"{name} is a {size_descriptor} suburb in {region}, located {cbd_km}km from {CBD} CBD 
with a population of {population}. {school_desc}. {transit_desc}. 
{fhog_status} {income_context}."
```

**S-2: ABS Data Vintage Notice**  
No notice anywhere that demographics are from 2021 census.  
Add below each demographics section: "Data: ABS Census 2021 — next update 2027"

**S-3: Due Diligence Links Section**  
Not implemented. GoodSuburb has a curated "Before you buy" section with links to:
- State flood mapping
- Planning portal
- School zone finder
- Aircraft noise checker
- NBN availability checker
- Free CoreLogic property report

This is a quick win: static HTML links per state, no backend needed.

**S-4: Hospital Section Missing From Results**  
The API returns `amenities.nearest_hospital` but the profile doesn't show the named hospital with distance.  
The data exists — it's just not displayed.

**S-5: Calculator CTAs on Suburb Profile Lack Context**  
The calc CTA cards at the bottom of the suburb profile are generic.  
They should be suburb-aware:
```
"Stamp duty for {suburb}? → Pre-fill [suburb state] and calculate"
"Can I afford a home in {suburb}? → With median price ~$XXX..."
```

### Navigation

**N-1: Land Tax Should Not Be a Top-Level Nav Tab**  
Current top nav: Suburb Search | Calculators | NBN Check | **Land Tax** | Bill Scanner  
Land Tax is too niche for a top-level tab. Move to "Calculators" dropdown/hub.  
Replace with: Suburb Search | Calculators | **Compare Energy** | NBN Check | More ↓

**N-2: Mobile Breakpoint**  
At ~600px, the 5 nav tabs overflow. Need a hamburger or scrollable tab strip.

**N-3: "Calculators" Nav Tab Links to Stamp Duty (not Hub)**  
The nav tab for Calculators links to `/calculators/stamp-duty` not `/calculators`.  
Fix: Link the nav tab to `/calculators` (the hub page).

---

## PART D: LEGAL — UPDATED STATUS

### Pre-launch admin items (ABN, email) — acknowledged as intentionally deferred
The following are still needed but acknowledged as "before go-live, not now":
- ABN registration (ATO — 10 min, free)
- Email aliases: `privacy@suburbsense.com.au`, `hello@suburbsense.com.au`

### Legal Gaps Still Active

**GAP-2: School Catchment Disclaimer** — STILL MISSING  
No visible warning banner above catchment zones. Current text is a single small-print line.  
Must add before launch: yellow banner with official zone checker links per state.

**GAP-3: AER Energy Rate Staleness** — STILL MISSING  
Energy comparison pages don't show when rates were last synced.  
Add: "Rates as at [sync_date] — verify with retailer before switching"

**GAP-5: ABS Data Vintage** — STILL MISSING  
Demographics sections don't note this is 2021 census data.  
Add near demographics: "ABS Census 2021 · Next update expected 2027"

**GAP-7: Affiliate Disclosure Adjacent to CIMET Links** — CHECK NEEDED  
Disclosure banner exists but verify it appears directly next to (not just near) every CIMET link.

**CALCULATOR-SPECIFIC: Borrowing Power Overestimates** — NEW  
Using interest rate without APRA 3% buffer is misleading. Fix bug-2 to fix the legal exposure.

---

## PART E: DATA ACCURACY — PRIORITY FIXES

| Item | Status | Action |
|------|--------|--------|
| VIC Land Tax rates wrong (4x underestimate) | ❌ BUG | Fix `property_tools.py` — BUG-1 |
| Borrowing power no APRA buffer | ❌ BUG | Add 3% buffer — BUG-2 |
| ROI deposit UX (fraction vs percent) | ❌ UX | Fix input to accept 0-100 |
| Perth coordinates swapped | ❌ DATA | SQL fix |
| AER sync run? (energy rates populated) | ❓ CHECK | `POST /api/aer/sync` |
| School data missing 73% suburbs | 🔄 ONGOING | ETL in progress |
| ABS data vintage labels | ❌ UI | Add 2021 notice to demographics |

---

## PART F: SEO — STILL ALL MISSING

None of these have been implemented yet:

- [ ] `/sitemap.xml` (dynamic, from suburbs table)
- [ ] `/robots.txt`
- [ ] `<meta description>` on StampDutyCalculator, LandTaxCalculator, CouncilRates, NBN pages
- [ ] Suburb page canonical URL
- [ ] Google Search Console submission
- [ ] Social sharing `og:image` for suburb pages

The ROI and CalculatorsHub pages DO have Helmet meta tags. The suburb profile page has FAQ schema. These are good. The calculator sub-pages (stamp duty, land tax, council rates, NBN, FHBA) still need meta tags.

---

## PART G: REVENUE FUNNEL — CONNECTIONS

| Page | Energy CTA | Lead Capture | Status |
|------|-----------|-------------|--------|
| FHBG result | ✅ "Compare energy" button | ❌ | Working |
| Stamp Duty result | ❌ | ❌ | Missing |
| ROI result | ❌ | ❌ | Missing |
| Affordability result | ❌ | ❌ | Missing |
| Land Tax result | ❌ | ❌ | Missing |
| Council Rates result | ❌ | ❌ | Missing |
| Suburb profile | ✅ At top | ❌ | Working |

**Every calculator result page needs an energy CTA at the bottom.** This is the direct revenue funnel.

---

## PRIORITY ORDER FOR THIS WEEK

### MUST FIX (bugs with wrong values)
1. Fix VIC land tax rates in `property_tools.py` (BUG-1) — 4x wrong
2. Fix borrowing power APRA buffer in `calculators.py` (BUG-2) — misleading
3. Fix ROI deposit input UX in `ROICalculator.jsx` (BUG-3) — confusing

### SHOULD DO (UX gaps)
4. Add energy CTA to all 5 calculator result pages (Stamp Duty, Affordability, ROI, Land Tax, Council Rates)
5. Add suburb template summary paragraph to SuburbProfile
6. Add ABS data vintage notice to demographics sections  
7. Fix nav tab: "Calculators" → links to /calculators hub (not /calculators/stamp-duty)
8. Move Land Tax out of top nav into Calculators dropdown/hub

### NICE TO HAVE (post-launch)
9. Homepage hero gradient + social proof strip
10. Due diligence links section on suburb profile  
11. Hospital display on suburb profile (data exists, not shown)
12. Borrowing Power standalone page
13. `/sitemap.xml` and `/robots.txt`
14. Dark mode toggle
15. Cross-calculator navigation (breadcrumbs or "Also try" links)

---

*Audit performed: 2026-08-24 · Tested via live API at port 8888 · Compared against SRO VIC, APRA guidelines, and Revenue NSW 2024-25 published rates*
