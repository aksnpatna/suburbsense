import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './StateHub.css';

const REGION_NAMES = {
  "greater-sydney": "Greater Sydney, NSW",
  "greater-melbourne": "Greater Melbourne, VIC",
  "greater-brisbane": "Greater Brisbane, QLD",
  "gold-coast": "Gold Coast, QLD",
  "sunshine-coast": "Sunshine Coast, QLD",
  "greater-adelaide": "Greater Adelaide, SA",
  "greater-perth": "Greater Perth, WA",
  "greater-darwin": "Greater Darwin, NT",
  "greater-hobart": "Greater Hobart, TAS",
  "canberra": "Canberra & ACT"
};

export function RegionHub() {
  const { regionSlug } = useParams();
  const [suburbs, setSuburbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuburbs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/suburbs/search?region=${regionSlug}&limit=500`);
        const data = await res.json();
        if (data.success || data.results) {
          setSuburbs(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch suburbs for region", err);
      }
      setLoading(false);
    };
    if (regionSlug) fetchSuburbs();
  }, [regionSlug]);

  const regionName = REGION_NAMES[regionSlug] || regionSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="state-hub">
      <Helmet>
        <title>Best Suburbs in {regionName} | SuburbSense</title>
        <meta name="description" content={`Explore demographics, school catchments, crime rates, and living costs for suburbs across ${regionName}. Find your perfect place to live.`} />
      </Helmet>

      <div className="hero">
        <div className="container">
          <h1>Suburbs in {regionName}</h1>
          <p>Discover real estate data, liveability scores, and demographics for {regionName}.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h2>All Suburbs in {regionName}</h2>
        {loading ? (
          <p>Loading suburbs...</p>
        ) : suburbs.length === 0 ? (
          <p>No suburbs found in this region.</p>
        ) : (
          <div className="suburb-grid">
            {suburbs.map(suburb => (
              <Link 
                key={suburb.id} 
                to={`/suburb/${suburb.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace(/,/g, '')}-${suburb.state.toLowerCase()}-${suburb.postcode}`}
                className="suburb-card"
              >
                <h3>{suburb.name}, {suburb.state} {suburb.postcode}</h3>
                <div className="suburb-stats">
                  {suburb.population_2021 && <span>👥 {suburb.population_2021.toLocaleString()} residents</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
