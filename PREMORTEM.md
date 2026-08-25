# Premortem: SuburbSense Free Data & Feature Audit

> Date: 2026-08-22
> Premortem question: "We launch SuburbSense with all these free tools. What could go wrong, and what are we missing?"

---

## EXECUTIVE SUMMARY

There is an enormous amount of free Australian government data available. The risk isn't running out of data — it's **scope creep** and **revenue delay**. Every tool we add needs to either (a) attract users who convert to affiliate leads, or (b) directly generate revenue. Free tools that don't feed the funnel are vanity features.

---

## FREE DATA SOURCES DISCOVERED

### 1. ABS Data API (api.data.abs.gov.au) — FREE, no API key
- **What**: Machine-to-machine Census 2021 data, demographics, SEIFA
- **Use**: Replace/augment our PostGIS suburb data with live API calls
- **Limitation**: Beta service, 2026 Census data not available until 2027
- **Status**: ⏳ Could supplement existing DB

### 2. AER CDR Energy API (cdr.energymadeeasy.gov.au) — FREE, no accreditation
- **What**: Live retail energy plan data from 79 retailers
- **Use**: Already implemented. Real plan comparison.
- **Coverage**: VIC, NSW, QLD, SA, ACT, TAS (not WA/NT)
- **Status**: ✅ Implemented

### 3. NBN Connection Lookup (nbnpy / unofficial API) — FREE
- **What**: Address-level NBN tech type (FTTP, HFC, FTTN, etc)
- **Use**: "What's available at this address?" tool — huge for users
- **Endpoint**: `https://nbn-service-check.deta.dev/check?address=` (mirror, unrestricted)
- **Package**: `pip install nbnpy`
- **Status**: ⏳ HIGH PRIORITY — this is a killer feature

### 4. School Catchment Boundaries — FREE (CC-BY)
| State | Source | Format | URL |
|-------|--------|--------|-----|
| NSW | data.nsw.gov.au | GeoJSON | School intake zones |
| VIC | discover.data.vic.gov.au | SHP | findmyschool.vic.gov.au |
| QLD | data.qld.gov.au | KML | Primary + Secondary |
| SA | data.sa.gov.au | SHP | High school zones |
| WA | - | - | Links to official finder |
| TAS/ACT/NT | - | - | Links to official finders |
- **Use**: "Which school zone am I in?" — massive for families
- **Status**: ⏳ HIGH PRIORITY

### 5. Crime Statistics — FREE (state portals)
| State | Source | Coverage |
|-------|--------|----------|
| VIC | Crime Statistics Agency | Suburb-level |
| NSW | BOCSAR | Suburb-level |
| QLD | QPS Crime Map API | Suburb + radius search |
| SA | data.sa.gov.au | Suburb-level |
| WA | WA Police | Suburb-level |
| ACT | ACT Policing | Suburb-level |
| TAS/NT | Not published at suburb level | — |
- **Use**: Safety score per suburb (like GoodSuburb/SuburbScan)
- **Status**: ⏳ MEDIUM — complex to normalise across states

### 6. First Home Guarantee (FHBG) — FREE government scheme
- **What**: 5% deposit, NO LMI, NO income cap, NO place limit (from Oct 2025)
- **Price caps**: Sydney $1.5M, Melbourne $950K, Brisbane $1M, Perth $850K, Adelaide $900K
- **Use**: Eligibility checker — "Can I use the scheme for this suburb/price?"
- **Tool**: Postcode search at housingaustralia.gov.au
- **Status**: ⏳ HIGH PRIORITY — very relevant, timely

### 7. Council Rates Estimates — FREE data
- **What**: 14,768 suburbs, 521 councils (RateScope model)
- **Use**: "Estimate annual council rates for this property"
- **Formula**: Property value × rate-in-the-dollar (varies by state valuation method)
- **Status**: ⏳ MEDIUM

### 8. Land Tax Calculator — FREE (state revenue offices)
- **What**: Annual tax on investment property land
- **Use**: "What's my annual land tax?" for investors
- **States**: All 8 have published rates
- **Status**: ⏳ MEDIUM (complements ROI calculator)

### 9. Postcode/Suburb Lookup APIs — FREE
- postcodeapi.com.au (100 req/hr free)
- australiansuburbs.au (free)
- addrest.com.au (free)
- **Use**: Autocomplete, address validation
- **Status**: ⏳ LOW (we already have DB for this)

### 10. Geoscape G-NAF — FREE (CC-BY, 5GB)
- **What**: 15.9M geocoded Australian addresses
- **Use**: Address-level search (upgrade from suburb-level)
- **Status**: ⏳ LOW (heavy for now, but future upgrade)

### 11. GTFS Transit Feeds — FREE (already using OSM)
- **What**: PTV, TfNSW, TransLink, Adelaide Metro, Transperth
- **Use**: Already have OSM. GTFS gives service frequency (better transit scores)
- **Status**: ⏳ LOW (enhancement, not new feature)

### 12. Bureau of Meteorology — FREE
- **What**: Climate data, rainfall, temperatures by location
- **Use**: "Suburb climate profile" — livability factor
- **Status**: ⏳ LOW

### 13. Property Tax Calculators (free tools)
- **Negative gearing**, **CGT**, **depreciation** — all calculable
- **Use**: Add to investment toolkit
- **Status**: ⏳ MEDIUM (complements ROI calc)

---

## COMPETITIVE GAP ANALYSIS

| Feature | GoodSuburb | SuburbCheck | SuburbScan | Us (now) | Gap |
|---------|-----------|-------------|------------|----------|-----|
| Suburb profiles | ✅ | ✅ | ✅ | ✅ | — |
| School data (ICSEA) | ✅ | ✅ | ✅ | ✅ | — |
| Transit scores (GTFS) | ✅ | ✅ | ✅ | ✅ | — |
| FHOG calculator | ✅ | ✅ | — | ✅ | — |
| Energy comparison (CIMET) | ✅ | — | — | ✅ | — |
| Internet comparison | ✅ | — | — | ⏳ | ADD |
| Crime/safety scores | — | ✅ | ✅ | ❌ | ADD |
| School catchment zones | — | — | — | ❌ | ADD |
| NBN lookup | — | — | — | ❌ | ADD |
| Stamp duty calc | — | — | — | ✅ | — |
| Affordability calc | — | — | — | ✅ | — |
| ROI/investment calc | — | — | — | ✅ | — |
| FHBG eligibility | — | — | — | ❌ | ADD |
| Council rates est. | — | — | — | ❌ | ADD |
| Bill scanner (AI) | — | — | — | ✅ | — |
| Grocery scanner (AI) | — | — | — | ✅ | — |

---

## RISK ANALYSIS (Premortem)

### Risk 1: Scope Creak → No Revenue
**Probability**: HIGH | **Impact**: HIGH
- We add 10 free tools, none drive affiliate conversions
- **Mitigation**: Every tool must have a CTA to energy/internet comparison or lead capture

### Risk 2: AER API Changes / Rate Limits
**Probability**: MEDIUM | **Impact**: MEDIUM
- AER could add rate limits or require registration
- **Mitigation**: Cache aggressively in `cached_energy_rates`, sync weekly

### Risk 3: NBN API Dies (unofficial)
**Probability**: MEDIUM | **Impact**: LOW
- Unofficial APIs can disappear
- **Mitigation**: Cache results locally, have fallback message

### Risk 4: School Catchment Data Goes Stale
**Probability**: HIGH | **Impact**: MEDIUM
- Catchments change annually
- **Mitigation**: Show "last updated" date, link to official source, disclaim heavily

### Risk 5: We Become a Calculator Site, Not a Revenue Site
**Probability**: MEDIUM | **Impact**: HIGH
- Users come for free tools, leave without converting
- **Mitigation**: Embed comparison CTAs in every calculator result

### Risk 6: GoodSuburb Adds Same Features
**Probability**: HIGH | **Impact**: LOW
- They're well-funded and could copy
- **Mitigation**: Our differentiator is AI bill scanners + investment tools + energy data depth

---

## RECOMMENDED PRIORITY ORDER

### Phase 2A (Next — High Impact, Low Effort)
1. **NBN Lookup Tool** — `nbnpy` is a pip install away. Huge user value.
2. **FHBG Eligibility Checker** — Just a table lookup + price cap check. Very timely.
3. **School Zone Display** — Show which public school catchment a suburb is in (NSW/VIC/QLD first)

### Phase 2B (Medium — More Data, More Value)
4. **Crime/Safety Scores** — Start with QLD (API) + SA (open data)
5. **Council Rates Estimator** — Simple formula, high perceived value
6. **Land Tax Calculator** — Complements ROI calc for investors

### Phase 2C (Future — Differentiators)
7. **Internet Plan Comparison** — When CIMET or similar partner ready
8. **Address-Level Search** — G-NAF integration
9. **Climate Profiles** — BOM data
10. **Depreciation Calculator** — For property investors

---

## REVENUE ALIGNMENT

| Tool | Direct Revenue | Funnel to Energy/Internet | User Acquisition |
|------|---------------|---------------------------|------------------|
| Stamp Duty | ❌ | ✅ (FHB → needs energy) | High |
| Affordability | ❌ | ✅ (buying → needs energy) | High |
| ROI Calculator | ❌ | ✅ (investor → needs energy) | Medium |
| NBN Lookup | ❌ | ✅ (moving → needs internet) | Very High |
| FHBG Checker | ❌ | ✅ (FHB → needs energy) | Very High |
| School Zones | ❌ | ✅ (families → needs energy) | High |
| Crime Scores | ❌ | ❌ | Medium |
| Council Rates | ❌ | ❌ | Medium |
| Bill Scanner | ❌ | ✅ (direct comparison) | High |
| Energy Compare | ✅ (CIMET) | ✅ (direct) | Very High |

**Key insight**: Every free tool should end with "While you're here, compare energy plans for this suburb" → CIMET affiliate link or lead capture.

---

## WHAT WE SHOULD NOT BUILD

1. **Property price estimates** — This is NPG/paid data territory. Avoid.
2. **Rental yield calculators using paid data** — Same issue.
3. **"Hot suburb" rankings** — Subjective, could be seen as investment advice.
4. **Mortgage broker recommendations** — Licensing issues.
5. **Legal/tax advice** — Disclaimer won't save us if we're wrong.

---

## LEGAL CHECKLIST

- [ ] Every data source has clear attribution on the page
- [ ] "General information only" disclaimer on all tools
- [ ] No savings claims on energy comparison (only rate extraction + reference)
- [ ] School catchment data has "confirm with school" disclaimer
- [ ] AER data has "verify with retailer" disclaimer
- [ ] Affiliate disclosure visible before any CIMET link
- [ ] Privacy policy covers email capture (leads)
- [ ] Terms of service limit liability for calculator accuracy
