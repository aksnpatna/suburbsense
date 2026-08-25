import { useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export function CompareSuburbs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [suburb1Slug, setSuburb1Slug] = useState(searchParams.get('s1') || '');
  const [suburb2Slug, setSuburb2Slug] = useState(searchParams.get('s2') || '');
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [showResults1, setShowResults1] = useState(false);
  const [showResults2, setShowResults2] = useState(false);

  const fetchSuburb = async (slug, setData, setLoading, setError) => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/suburbs/${slug}`);
      if (!res.ok) throw new Error('Suburb not found');
      const data = await res.json();
      setData(data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    const params = {};
    if (suburb1Slug) params.s1 = suburb1Slug;
    if (suburb2Slug) params.s2 = suburb2Slug;
    setSearchParams(params);
    fetchSuburb(suburb1Slug, setData1, setLoading1, setError1);
    fetchSuburb(suburb2Slug, setData2, setLoading2, setError2);
  };

  const handleSearch = useCallback(async (query, setResults, setShow) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/suburbs/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      setResults(data.results || []);
      setShow(true);
    } catch {
      setResults([]);
    }
  }, []);

  const handleSelectSuburb = (suburb, setSlug, setQuery, setShow) => {
    const slug = suburb.slug || `${suburb.name.toLowerCase().replace(/\s+/g, '-')}-${suburb.state.toLowerCase()}-${suburb.postcode}`;
    setSlug(slug);
    setQuery(`${suburb.name}, ${suburb.state} ${suburb.postcode}`);
    setShow(false);
  };

  const compareRows = [
    { label: 'Population', key1: (d) => d?.demographics?.population_2021?.toLocaleString(), key2: (d) => d?.demographics?.population_2021?.toLocaleString(), higherWins: true },
    { label: 'Median Age', key1: (d) => `${d?.demographics?.median_age} yrs`, key2: (d) => `${d?.demographics?.median_age} yrs` },
    { label: 'Household Size', key1: (d) => `${d?.demographics?.average_household_size}`, key2: (d) => `${d?.demographics?.average_household_size}` },
    { label: 'Owner-Occupier', key1: (d) => `${d?.demographics?.owner_occupier_rate}%`, key2: (d) => `${d?.demographics?.owner_occupier_rate}%`, higherWins: true },
    { label: 'Investor Rate', key1: (d) => `${d?.demographics?.investor_rate}%`, key2: (d) => `${d?.demographics?.investor_rate}%` },
    { label: 'Income Band', key1: (d) => d?.demographics?.predominant_income_band, key2: (d) => d?.demographics?.predominant_income_band },
    { label: 'Schools', key1: (d) => d?.education?.school_count, key2: (d) => d?.education?.school_count, higherWins: true },
    { label: 'Avg ICSEA', key1: (d) => d?.education?.avg_icsea ? Math.round(d.education.avg_icsea) : 'N/A', key2: (d) => d?.education?.avg_icsea ? Math.round(d.education.avg_icsea) : 'N/A', higherWins: true },
    { label: 'Transit Score', key1: (d) => `${d?.scores?.transit}/100`, key2: (d) => `${d?.scores?.transit}/100`, higherWins: true },
    { label: 'School Score', key1: (d) => `${d?.scores?.schools}/100`, key2: (d) => `${d?.scores?.schools}/100`, higherWins: true },
    { label: 'Parks Score', key1: (d) => `${d?.scores?.parks}/100`, key2: (d) => `${d?.scores?.parks}/100`, higherWins: true },
    { label: 'Accessibility', key1: (d) => `${d?.scores?.accessibility}/100`, key2: (d) => `${d?.scores?.accessibility}/100`, higherWins: true },
    { label: 'CBD Distance', key1: (d) => `${d?.transport?.cbd_distance_mins} min`, key2: (d) => `${d?.transport?.cbd_distance_mins} min`, higherWins: false },
    { label: 'Parks Count', key1: (d) => d?.environment?.parks_count, key2: (d) => d?.environment?.parks_count, higherWins: true },
    { label: 'Median Age Group', key1: (d) => d?.demographics?.predominant_age_group, key2: (d) => d?.demographics?.predominant_age_group },
    { label: 'Household Type', key1: (d) => d?.demographics?.predominant_household, key2: (d) => d?.demographics?.predominant_household },
  ];

  const getValue = (d, keyFn) => {
    if (!d) return null;
    const v = keyFn(d);
    return (v === null || v === undefined || v === '') ? 'N/A' : v;
  };

  const parseNum = (v) => {
    if (v === 'N/A' || v === null) return null;
    const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? null : n;
  };

  const isWinner = (row, v1, v2) => {
    const n1 = parseNum(v1);
    const n2 = parseNum(v2);
    if (n1 === null || n2 === null) return [false, false];
    if (n1 === n2) return [false, false];
    if (row.higherWins) return [n1 > n2, n2 > n1];
    return [n1 < n2, n2 < n1];
  };

  const hasComparison = data1 || data2;

  return (
    <div className="container">
      <Helmet>
        <title>Compare Suburbs Side-by-Side | SuburbSense</title>
        <meta name="description" content="Compare any two Australian suburbs side-by-side: schools, transit, income, demographics, scores." />
      </Helmet>

      <div className="suburb-compare-page">
        <div className="calc-header">
          <h1>Compare Suburbs</h1>
          <p>Select two suburbs to compare schools, transit, income and demographics side-by-side.</p>
        </div>

        <div className="compare-search-row">
          <div className="suburb-search">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery1}
                onChange={(e) => { setSearchQuery1(e.target.value); handleSearch(e.target.value, setSearchResults1, setShowResults1); }}
                onFocus={() => searchResults1.length > 0 && setShowResults1(true)}
                placeholder="Search first suburb..."
                className="suburb-search-input"
              />
            </div>
            {showResults1 && searchResults1.length > 0 && (
              <div className="search-results">
                {searchResults1.map((s, i) => (
                  <div key={i} className="search-result-item" onClick={() => handleSelectSuburb(s, setSuburb1Slug, setSearchQuery1, setShowResults1)}>
                    <div className="result-name">{s.name}</div>
                    <div className="result-location">{s.state}, {s.postcode}</div>
                  </div>
                ))}
              </div>
            )}
            {loading1 && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading...</p>}
            {error1 && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--error-color)' }}>{error1}</p>}
            {data1 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>{data1.name}</strong>, {data1.state} {data1.postcode}
              </div>
            )}
          </div>

          <div className="compare-vs">VS</div>

          <div className="suburb-search">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery2}
                onChange={(e) => { setSearchQuery2(e.target.value); handleSearch(e.target.value, setSearchResults2, setShowResults2); }}
                onFocus={() => searchResults2.length > 0 && setShowResults2(true)}
                placeholder="Search second suburb..."
                className="suburb-search-input"
              />
            </div>
            {showResults2 && searchResults2.length > 0 && (
              <div className="search-results">
                {searchResults2.map((s, i) => (
                  <div key={i} className="search-result-item" onClick={() => handleSelectSuburb(s, setSuburb2Slug, setSearchQuery2, setShowResults2)}>
                    <div className="result-name">{s.name}</div>
                    <div className="result-location">{s.state}, {s.postcode}</div>
                  </div>
                ))}
              </div>
            )}
            {loading2 && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading...</p>}
            {error2 && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--error-color)' }}>{error2}</p>}
            {data2 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>{data2.name}</strong>, {data2.state} {data2.postcode}
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCompare}
          disabled={!suburb1Slug || !suburb2Slug || loading1 || loading2}
          style={{ marginBottom: '2rem' }}
        >
          {(loading1 || loading2) ? 'Loading...' : 'Compare Suburbs'}
        </button>

        {hasComparison && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="metric-name">Metric</th>
                  <th className="suburb-col-1" style={{ color: 'var(--primary-color)' }}>
                    {data1 ? `${data1.name}, ${data1.state}` : 'Suburb 1'}
                  </th>
                  <th className="suburb-col-2" style={{ color: '#10b981' }}>
                    {data2 ? `${data2.name}, ${data2.state}` : 'Suburb 2'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, idx) => {
                  const v1 = getValue(data1, row.key1);
                  const v2 = getValue(data2, row.key2);
                  const [w1, w2] = isWinner(row, v1, v2);
                  return (
                    <tr key={idx}>
                      <td className="metric-name">{row.label}</td>
                      <td className={w1 ? 'compare-winner' : (w2 ? 'compare-loser' : '')}>{v1 || 'N/A'}</td>
                      <td className={w2 ? 'compare-winner' : (w1 ? 'compare-loser' : '')}>{v2 || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!hasComparison && (
          <div className="compare-empty">
            <h3>Select two suburbs above to compare</h3>
            <p>Compare schools, transit, income, demographics and more side-by-side.</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary">Browse Suburbs</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
