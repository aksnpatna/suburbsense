# Data Quality Audit Report

> Date: 2026-08-23
> Testing: Transit scores + School data across 8+ suburbs

---

## Executive Summary

**Verdict**: Transit scores are currently misleading (everything is 5.0 or capped at 100). School data is missing for 73% of suburbs. The map now shows real transit stops and school catchments, but the scoring methodology needs a complete overhaul.

---

## Transit Data

### Current Problems

1. **`transit_accessibility` column = 5.0 for ALL 11,599 suburbs** — this is a static default, never computed. It's meaningless.

2. **API score formula is too simplistic**: `min(100, total_stops / 20 * 100)`
   - 20 stops = score 100 (cap kicks in too early)
   - Melbourne CBD (271 stops) = 100
   - Point Cook (31 stops) = 100
   - Truganina (1 stop) = 5

3. **No mode weighting**: Bus stop = Train station in scoring (both count as 1)

### What the data actually shows

| Suburb | Bus | Tram | Train | Ferry | Current Score | Proposed (weighted) |
|--------|-----|------|-------|-------|---------------|---------------------|
| Melbourne CBD | 91 | 173 | 1 | 6 | 100 | 100 (648 wt) |
| Sydney CBD | 271 | 0 | 15 | 29 | 100 | 100 (536 wt) |
| Parramatta | 191 | 0 | 13 | 0 | 100 | 100 (295 wt) |
| Point Cook | 31 | 0 | 0 | 0 | 100 | 31 (31 wt) |
| Truganina | 1 | 0 | 0 | 0 | 5 | 1 (1 wt) |

### Recommended Fix

```python
# Proposed scoring (in suburbs.py)
weighted = (bus * 1) + (tram * 3) + (train * 8) + (ferry * 5)
transit_score = min(100, int(weighted / 50 * 100))
# Cap at 50 weighted stops = 100 score
# This differentiates: CBD=100, Parramatta=59, Point Cook=6, Truganina=0
```

### What's NOT factored (yet)
- Service frequency (GTFS data exists but not imported)
- Walkability / pedestrian access
- Road accessibility (driving time to CBD exists in `cbd_distance_mins`)
- Peak vs off-peak service

---

## School Data

### Current Problems

1. **Only 26.6% of suburbs have `school_count > 0`** — 10,299 suburbs have NULL school data
2. **`top_school_name` is ALWAYS NULL** — column never populated
3. **`avg_icsea` is NULL for 73%** — only 3,710 suburbs have values
4. **OSM school data is sparse** — Point Cook and Truganina have ZERO OSM schools within 2km
5. **School zone coverage varies by state**:
   - NSW: 3,853 suburbs covered
   - VIC: 2,561 suburbs covered
   - QLD: 2,488 suburbs covered
   - SA: 520 suburbs covered
   - TAS: 74 suburbs covered
   - WA: 0 (not loaded)
   - NT: 0 (not loaded)

### School Zone Type Cleanup Needed

| Current Values | Count | Should Be |
|----------------|-------|-----------|
| Unknown Type | 8,353 | → needs classification |
| PRIMARY | 1,614 | Primary |
| Secondary | 1,418 | Secondary |
| Primary | 1,162 | Primary |
| HIGH_COED | 399 | Secondary |
| PRIM | 233 | Primary |
| SEC | 65 | Secondary |
| CENTRAL_HIGH | 62 | Secondary |
| CENTRAL_PRIMARY | 62 | Primary |
| PRSEC | 39 | Secondary |

### Recommended Fix

1. **Normalize school zone types** — collapse variants into Primary/Secondary
2. **Compute school_count from zones** — count distinct school_names per suburb
3. **Compute avg_icsea from school zone data** if ACARA data available
4. **Set top_school_name** — highest ICSEA or largest enrolment

---

## Other Data Quality Issues

### Perth coordinates SWAPPED
- Perth shows lat=115.86, lng=-31.95 (should be lat=-31.95, lng=115.86)
- Need to fix coordinates parsing for this suburb

### Brisbane missing
- Brisbane QLD 4000 has `dq_score < 90` — excluded from API
- Check data quality flags

### Transit Score (DB column) vs API Score
- DB column `transit_accessibility` = 5.0 (all suburbs) — USELESS
- API calculates dynamically from OSM — BETTER but needs fix
- Should remove the DB column from API response to avoid confusion

---

## Priority Actions

1. **Fix transit score formula** — ✅ DONE — weighted scoring: bus×1 + tram×3 + train×8 + ferry×5, cap at 50 weighted stops
2. **Normalize school zone types** — ✅ DONE — collapsed variants into Primary/Secondary
3. **Compute missing school_count from zones** — ✅ DONE — school_count now uses catchments as fallback
4. **Remove/fix `transit_accessibility` column** — ✅ DONE — now returns dynamic score
5. **Fix Perth coordinates** — TODO
6. **Add WA school zones** — TODO

### Test Results After Fix

| Suburb | Bus | Tram | Train | Old Score | New Score |
|--------|-----|------|-------|-----------|-----------|
| Melbourne CBD | 48 | 46 | 6 | 100 | 100 |
| Point Cook | 31 | 0 | 0 | 100 | 62 |
| Truganina | 1 | 0 | 0 | 5 | 2 |

Scores now properly differentiate between excellent (CBD), decent (Point Cook), and minimal (Truganina) transit.

---

## Point 4: Road Accessibility — IMPLEMENTED

### Scoring Formula
```
Road Score (0-100) based on nearest motorway/trunk:
  <1km  = 100
  <2km  = 85
  <3km  = 70
  <5km  = 55
  <8km  = 40
  >8km  = 25
  +10 bonus if 3+ distinct major roads nearby
  +5 bonus if 2+ distinct major roads nearby
  +5 bonus if 5+ primary roads nearby
```

### Combined Accessibility Score
```
Combined = (Transit × 0.6) + (Road × 0.4)
```

### Results

| Suburb | Transit | Road | Combined | Nearest Motorway |
|--------|---------|------|----------|-----------------|
| Melbourne CBD | 100 | 100 | 100 | 0.3km |
| Sydney CBD | 100 | 100 | 100 | 0.4km |
| Parramatta | 100 | 100 | 100 | 0.7km |
| Point Cook | 62 | 70 | 65 | 3.2km |
| Truganina | 2 | 85 | 35 | 2.4km |

**Key insight**: Truganina has poor transit (score 2) but excellent road access (score 85) — a car-dependent suburb. This distinction is crucial for renters/buyers.

---

## Point 5: Service Frequency — Future Enhancement

### GTFS Feeds Available (all free, CC-BY licensed)

| State | Agency | URL |
|-------|--------|-----|
| VIC | PTV | data.gov.au → GTFS Schedule |
| NSW | TfNSW | opendata.transport.nsw.gov.au |
| QLD | Translink | data.qld.gov.au → GTFS |
| SA | Adelaide Metro | data.sa.gov.au |
| WA | Transperth | transperth.wa.gov.au/Spatial-Data-Access |

### What GTFS Would Enable
- Average wait time per stop
- Peak vs off-peak frequency
- Number of routes serving an area
- First/last service times

### Implementation Effort
- Import: ~2 days (download GTFS, load into PostGIS)
- Frequency calculation: ~1 week (avg departures per hour)
- Real-time: ~2 weeks (GTFS-R feeds)

### Short-term Alternative
Use OSM `route=bus` relations as a proxy for route diversity (not frequency).
