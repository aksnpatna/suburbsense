# SuburbSense — Improvement Plan (Next Round)

> Date: 2026-08-24
> Supersedes: `improvement.md` (that file is now partially stale — see reconciliation below)
> Premortem question: "It's launch day for the CIMET-monetised SuburbSense. What made it fail?"
> Note: goodsuburb.com could not be fetched (403 / bot-protected). GoodSuburb comparison below is based on known patterns + the gap analysis in `PREMORTEM.md`. A manual UI review is listed as task C-0.

---

## 0. Status Reconciliation (verified against code today)

Items in `improvement.md` listed as open are **already fixed in code** — do NOT re-do:

**Verified FIXED:**
- BUG-1 VIC land tax rates — correct 2024-25 SRO table in `property_tools.py` ✅
- BUG-2 Borrowing power APRA buffer — `assessment_rate = interestRate + 3.0` in `calculators.py:277` ✅
- BUG-3 ROI deposit input — 0-100 percentage with `/100` on submit in `ROICalculator.jsx` ✅
- Hero gradient, social-proof strip, use-case feature cards — `App.jsx` / `index.css:513` ✅
- Nav: "Calculators" → `/calculators` hub; Land Tax inside "Tools" dropdown ✅
- Suburb summary paragraph, ABS 2021 vintage notice, hospital section, catchment warning banner ✅
- Energy (CIMET) CTA on ALL calculator result pages ✅
- Affiliate disclosure adjacent to CIMET links ✅
- `/api/robots.txt` + `/api/sitemap.xml` in `seo.py` ✅
- Helmet meta tags on most pages ✅

---

## PART A: PREMORTEM — How This Fails at Launch

### A-1: SPA rendering kills SEO (HIGH impact)
Client-rendered Vite React SPA. All SEO value (Helmet titles, FAQ ld+json, og:tags) exists only **after JS executes**. Social/crawler bots get the empty `index.html` shell — no og:image on suburb-page shares. Sitemap lists 11,599 suburb pages Google will crawl slowly/inconsistently.
**Fix:** prerender via `vite-plugin-prerender` / `react-snap` for calculator + top-suburb pages; inject static fallback title/meta/og tags into `index.html`.

### A-2: Single point of revenue failure (HIGH)
100% of revenue intent routes through ONE CIMET URL set (`EnergyCompare.jsx` CIMET_URLS). If approval stalls or links break, revenue = $0.
**Fix:** add internet comparison as second vertical (CIMET supports it), wire lead capture (`/api/leads/`) as fallback on every CTA.

### A-3: "Compare" CTA may be a dead end (MEDIUM/HIGH)
Suburb profile CTAs link to `/compare?vertical=energy&suburb=...` — `ComparePage.jsx` is a legacy suburb-compare page, not the CIMET redirect. Users clicking the primary revenue CTA may land on the wrong page.
**Fix:** verify ComparePage honours `vertical`/`suburb` params, or repoint CTAs to `/energy/compare`. Test click path end-to-end.

### A-4: Data trust cliff (MEDIUM/HIGH)
One wrong number destroys a "data-first" brand: Perth lat/lng swapped, Brisbane excluded by `dq_score`, school data missing for 73% of suburbs, NSW land tax threshold `$1,069,000` vs 2024-25 `$1,075,000`. "School Data Pending" on 3/4 of suburbs reads as broken.
**Fix:** Part B fixes + "last verified" date on every calculator result.

### A-5: Mobile nav overflow (MEDIUM)
`.nav-links` (Suburbs | Calculators | Energy | Tools▾) has NO media-query rule — the `.nav` rule at `index.css:1469` targets a selector the header doesn't use. Expect overflow under ~600px where most suburb searches happen.
**Fix:** hamburger or scrollable strip under 768px; test at 360px.

### A-6: Analytics blindness (MEDIUM)
No analytics/conversion tracking found in code. Cannot measure which calculator feeds CIMET clicks — the funnel thesis is untestable.
**Fix:** Umami/Plausible (self-hosted, no consent banner) + click events on every CIMET link and funnel events suburb→calculator→energy.

### A-7: Sitemap/canonical origin mismatch (LOW/HIGH)
`robots.txt` points sitemap to `{site_origin}/api/sitemap.xml`; canonicals say `suburbsense.com.au`. If deployed origin differs, sitemap unreachable.
**Fix:** verify `site_origin` env on prod; serve robots/sitemap at domain root via rewrites.

### A-8: Footer "Subscribe" is a fake button (LOW)
`App.jsx:115` renders a Subscribe button with no handler.
**Fix:** wire to `/api/leads/` or remove.

---

## PART B: BUG / DATA FIXES (do first)

| # | Item | Where |
|---|------|-------|
| B-1 | Fix Perth coordinates (lat/lng swapped) | DB / ETL |
| B-2 | Brisbane QLD 4000 excluded by `dq_score < 90` | `suburbs.py` / data |
| B-3 | NSW land tax: threshold $1,075,000, `$100 + 1.6%` formula per Revenue NSW 2024-25; re-check `fixed[]` | `property_tools.py` |
| B-4 | Run `POST /api/aer/sync`, verify `cached_energy_rates` populated; show "Rates as at [date]" | `aer.py` / `EnergyCompare.jsx` |
| B-5 | Wire footer Subscribe → `/api/leads/` (or remove) | `App.jsx` |
| B-6 | Hamburger/scroll-strip for `.nav-links` under 768px | `App.jsx` / `index.css` |
| B-7 | Verify `/compare?vertical=energy...` path (A-3); repoint CTAs if broken | `ComparePage.jsx` / `App.jsx` |

---

## PART C: UI IMPROVEMENTS (GoodSuburb benchmark)

- [ ] **C-0 Manual benchmark:** open goodsuburb.com side-by-side (blocks bots — must be manual). Score: suburb page layout, score presentation, review UGC, due-diligence section, comparison UX. Annotate this file.
- [ ] **C-1 "Due Diligence / Before You Buy" section** on suburb profile (quick win — static per-state links): flood mapping, planning portal, official school zone finder, aircraft noise, NBN checker, free property report. No backend.
- [ ] **C-2 Suburb-aware calculator CTAs:** the 4 generic cards (`App.jsx:806-838`) should pre-fill state/postcode. Fix duplicate bug: "First Home Guarantee" currently links to `/calculators/affordability` instead of `/fhbg`.
- [ ] **C-3 Cross-calculator navigation:** "Also try:" strip under each result (Stamp Duty ↔ FHBG ↔ Affordability; ROI ↔ Land Tax ↔ Council Rates).
- [ ] **C-4 "What next?" block** on calc results: energy compare + NBN check + school catchments in one compact row.
- [ ] **C-5 Energy CTA visual weight:** gradient + ⚡ on the Energy nav link — it is the revenue button, currently same weight as other tabs.
- [ ] **C-6 og:image for suburb pages:** generate share image (score ring + name) for top ~500 suburbs; needed for A-1 prerender to pay off on socials.
- [ ] **C-7 Calculator result polish:** Affordability shows monthly repayment prominently; ROI adds gross-vs-net yield explainer + 4-6% benchmark band; Land Tax adds "PPR exempt" explainer; Council Rates shows min–max range not just average.

---

## PART D: NEW DATA / DIFFERENTIATION IDEAS (post-stabilisation)

Ordered by funnel value, all free sources:

1. **D-1 Internet plan comparison via CIMET** — pages already say "Compare Internet" but no flow exists. Highest straightforward revenue addition (GoodSuburb monetises both).
2. **D-2 Due-diligence data:** state flood/bushfire overlay links + aircraft noise (Airservices) — pairs with C-1.
3. **D-3 Crime/safety depth** — start QLD (QPS API) + SA (open data) per `PREMORTEM.md`; `environment.crime_rate`/`safety_score` scaffolding exists; extend coverage.
4. **D-4 Programmatic SEO:** indexable `/compare/{a}-vs-{b}` pre-rendered comparison pages + state-hub interlinking.
5. **D-5 ABS 2026 Census readiness:** releases roll out from 2027 — prepare swap-in pipeline for G01/G32/G33 to be first among free tools to refresh.
6. **D-6 Lead magnet on calc results:** "Email me this result + cheapest energy plan for {postcode}" → `/api/leads/` (endpoint exists). Builds owned audience before relying on CIMET.
7. **D-7 GTFS service frequency (later):** weight transit score by departures/hour, not stop count. Do not start before A-1 and Part B are done.

Out of scope (per `PREMORTEM.md`): property price estimates, hot-suburb rankings, broker referrals, anything needing AFSL/ACL advice.

---

## PRIORITY ORDER

**Blockers before launch:**
1. B-7 verify `/compare?vertical=energy` CTA converts
2. B-4 AER sync + rates freshness label
3. B-1, B-2, B-3 data fixes
4. A-1 prerender decision (minimal: static pages first)
5. A-6 analytics + CIMET click tracking
6. B-6 mobile nav, B-5 subscribe button

**Launch week:**
7. C-1 due diligence links
8. C-2 suburb-aware CTAs (incl. `/fhbg` link fix)
9. C-3, C-4 cross-calc navigation + next-steps
10. A-7 robots/sitemap at domain root; A-8

**Post-launch:**
11. C-0 manual GoodSuburb benchmark → refine C-5..C-7
12. D-1 internet comparison, D-6 lead magnet
13. D-4 programmatic compare pages, C-6 og:image
14. D-2, D-3 hazard + crime depth
15. D-5 census pipeline, D-7 GTFS frequency

---

## VALIDATION

- Spot-check calculator outputs vs SRO VIC / Revenue NSW / Housing Australia published figures after B-3, B-4.
- `curl` each CTA path from suburb page → confirm CIMET redirect keeps state/postcode params.
- Lighthouse mobile run at 360px on home + one suburb page.
- Fetch `https://suburbsense.com.au/robots.txt` and `/sitemap.xml` from domain root after deploy.
- Share a suburb URL in Messages/Slack — confirm title/description/image preview renders (tests A-1/C-6).

## OPEN QUESTIONS

1. Is CIMET approval for internet too, or energy only? (Decides D-1.)
2. Prerender: `vite-plugin-prerender` (build-time; suburb pages stale until rebuild) vs edge prerender service (dynamic, more infra)? Recommend build-time for calculator/hub/state pages first.
3. Analytics: Umami (self-hosted) vs GA4? Recommend Umami — no consent banner, matches "free, no-login" positioning.
