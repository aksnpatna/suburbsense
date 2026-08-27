import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SuburbTOC } from './components/SuburbTOC';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SuburbSearch } from './components/SuburbSearch';
import { ScoreChips } from './components/ScoreChips';
import { SaveSuburbButton, SuburbAlertSignup } from './components/SaveSuburb';
import { SuburbLibraryRails } from './components/SuburbLibraryRails';
import { ThemeToggle } from './components/ThemeToggle';
import { recordRecentVisit } from './hooks/useSuburbLibrary';
import { AINewsSection } from './components/AINewsSection';
import { GlobalMarketPulse } from './components/GlobalMarketPulse';
import { TrendingTicker } from './components/TrendingTicker';
import { PartnersPage } from './components/PartnersPage';
import { RegionHub } from './pages/RegionHub';
import { LegalPage } from './pages/LegalPage';
import { ComparePage } from './pages/ComparePage';
import { StampDutyCalculator } from './pages/StampDutyCalculator';
import { AffordabilityCalculator } from './pages/AffordabilityCalculator';
import { ROICalculator } from './pages/ROICalculator';
import { EnergyCompare } from './pages/EnergyCompare';
import { NBNLookup } from './pages/NBNLookup';
import { FHBAChecker } from './pages/FHBAChecker';
import { LandTaxCalculator } from './pages/LandTaxCalculator';
import { CouncilRatesEstimator } from './pages/CouncilRatesEstimator';
import { CalculatorsHub } from './pages/CalculatorsHub';
import { CompareSuburbs } from './pages/CompareSuburbs';
import { StateHub } from './pages/StateHub';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { FeedbackWidget } from './components/FeedbackWidget';
import { GuidePage } from './pages/GuidePage';
import { useAnalytics } from './hooks/useAnalytics';

const AmenityMap = React.lazy(() => import('./components/AmenityMap').then(m => ({ default: m.AmenityMap })));

function useScrollReveal() {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger'
    );
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);
}

function useScrollRevealLazy(locationPath) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger'
      );
      elements.forEach((el) => {
        if (!el.classList.contains('revealed')) {
          observer.observe(el);
        }
      });
    };

    // Initial check
    observeElements();

    // Watch for DOM changes (like async data loading)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [locationPath]);
}

function App() {
  const location = useLocation();
  useAnalytics();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useScrollRevealLazy(location.pathname);
  
  const isHome = location.pathname === '/';
  const isSuburb = location.pathname.startsWith('/suburb/');
  const isCalculator = location.pathname.startsWith('/calculators');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribeLoading(true);
    setSubscribeMsg('');
    try {
      const resp = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: subscribeEmail, vertical: 'energy', suburb_slug: '' })
      });
      if (!resp.ok) throw new Error('Failed to subscribe');
      setSubscribeMsg('Thanks! We\'ll keep you updated.');
      setSubscribeEmail('');
    } catch {
      setSubscribeMsg('Something went wrong. Please try again.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
      <div className="app-container">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo" onClick={closeMobileMenu}>
                <span className="logo-icon">🏘️</span>
                <span className="logo-text">SuburbSense</span>
              </Link>
              <button className="hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
              <ThemeToggle />
              <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                {mobileMenuOpen && (
                  <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
                    &times;
                  </button>
                )}
                <Link to="/" className={`nav-link ${isHome || isSuburb ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Suburbs
                </Link>
                <Link to="/calculators" className={`nav-link ${isCalculator ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Calculators
                </Link>
                <Link to="/energy/compare" className={`nav-link nav-link-energy ${location.pathname.startsWith('/energy/compare') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Energy
                </Link>
                <Link to="/suburb/compare" className={`nav-link ${location.pathname === '/suburb/compare' ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Compare
                </Link>
                <Link to="/partners" className={`nav-link ${location.pathname === '/partners' ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Find Professionals
                </Link>
                <div className={`nav-dropdown ${dropdownOpen ? 'active' : ''}`}>
                  <button className="nav-link dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    Tools <span className="dropdown-arrow">▾</span>
                  </button>
                  <div className="nav-dropdown-menu" onClick={() => setDropdownOpen(false)}>
                    <Link to="/nbn" onClick={closeMobileMenu}>NBN Check</Link>
                    <Link to="/land-tax" onClick={closeMobileMenu}>Land Tax Calculator</Link>
                    <Link to="/council-rates" onClick={closeMobileMenu}>Council Rates</Link>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/state/:stateId" element={<StateHub />} />
            <Route path="/suburb/:slug" element={<SuburbProfile />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/calculators" element={<CalculatorsHub />} />
            <Route path="/calculators/stamp-duty" element={<StampDutyCalculator />} />
            <Route path="/calculators/affordability" element={<AffordabilityCalculator />} />
            <Route path="/calculators/roi" element={<ROICalculator />} />
            <Route path="/energy/compare" element={<EnergyCompare />} />
            <Route path="/nbn" element={<NBNLookup />} />
            <Route path="/fhbg" element={<FHBAChecker />} />
            <Route path="/land-tax" element={<LandTaxCalculator />} />
            <Route path="/council-rates" element={<CouncilRatesEstimator />} />
            <Route path="/suburb/compare" element={<CompareSuburbs />} />
            <Route path="/region/:regionSlug" element={<RegionHub />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/attribution" element={<LegalPage type="attribution" />} />
            <Route path="/legal/disclosure" element={<LegalPage type="disclosure" />} />
            
            {/* SEO Programmatic Guides */}
            <Route path="/guides/:state/:category" element={<GuidePage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>

        <FeedbackWidget />

         <footer className="footer" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏘️</span> SuburbSense
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Australian suburb intelligence. Data-driven insights to help you find the perfect place to live, invest, or rent.
                </p>
                <div className="cimet-badge" style={{ marginBottom: '1rem' }}>
                  <span>⚡ Compare Energy</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <a href="https://twitter.com/suburbsense" target="_blank" rel="noopener noreferrer" style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s ease'
                  }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}>
                    🐦
                  </a>
                  <a href="https://facebook.com/suburbsense" target="_blank" rel="noopener noreferrer" style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s ease'
                  }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}>
                    📘
                  </a>
                  <a href="https://linkedin.com/company/suburbsense" target="_blank" rel="noopener noreferrer" style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s ease'
                  }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary-color)'}>
                    💼
                  </a>
                </div>
              </div>
              <div className="footer-col">
                <h4>Explore</h4>
                <ul>
                  <li><Link to="/" onClick={() => window.scrollTo(0,0)}>Suburb Search</Link></li>
                  <li><Link to="/compare" onClick={() => window.scrollTo(0,0)}>Compare Suburbs</Link></li>
                  <li><Link to="/calculators" onClick={() => window.scrollTo(0,0)}>Calculators</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Tools</h4>
                <ul>
                  <li><Link to="/energy/compare" onClick={() => window.scrollTo(0,0)}>Compare Energy</Link></li>
                  <li><Link to="/calculators/affordability" onClick={() => window.scrollTo(0,0)}>Affordability Calc</Link></li>
                  <li><Link to="/calculators/stamp-duty" onClick={() => window.scrollTo(0,0)}>Stamp Duty Calc</Link></li>
                  <li><Link to="/calculators/roi" onClick={() => window.scrollTo(0,0)}>ROI Calculator</Link></li>
                  <li><Link to="/nbn" onClick={() => window.scrollTo(0,0)}>NBN Checker</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal & Info</h4>
                <ul>
                  <li><Link to="/privacy" onClick={() => window.scrollTo(0,0)}>Privacy Policy</Link></li>
                  <li><Link to="/terms" onClick={() => window.scrollTo(0,0)}>Terms of Service</Link></li>
                  <li><Link to="/disclosure" onClick={() => window.scrollTo(0,0)}>Affiliate Disclosure</Link></li>
                  <li><Link to="/attribution" onClick={() => window.scrollTo(0,0)}>Data Sources</Link></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p>&copy; {new Date().getFullYear()} SuburbSense. All rights reserved.</p>
              <div style={{ fontSize: '0.8rem' }}>
                Made in Australia 🇦🇺
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}

function HomePage() {
  const [selectedSuburb, setSelectedSuburb] = useState(null);

  const handleSuburbSelect = (suburb) => {
    setSelectedSuburb(suburb);
  };

  return (
    <>
      <TrendingTicker />
      <div className="container">
        <Helmet>
          <title>SuburbSense — Find the Best Suburbs in Australia | Free Property Data & Insights</title>
          <meta name="description" content="Research any Australian suburb with real ABS census data, ACARA school ratings, transit scores, crime stats and cost-of-living tools. Free, no login required." />
          <meta name="keywords" content="Australian suburbs, property data, suburb research, school ratings, transit scores, ABS census, cost of living, property investment" />
          <meta name="author" content="SuburbSense" />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="canonical" href="https://suburbsense.com.au" />
          <meta property="og:title" content="SuburbSense — Find the Best Suburbs in Australia" />
          <meta property="og:description" content="Real ABS census data, school ratings, transit scores — all free, no login." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://suburbsense.com.au" />
          <meta property="og:site_name" content="SuburbSense" />
          <meta property="og:locale" content="en_AU" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="SuburbSense — Find the Best Suburbs in Australia" />
          <meta name="twitter:description" content="Real ABS census data, school ratings, transit scores — all free, no login." />
        </Helmet>
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SuburbSense",
            "url": "https://suburbsense.com.au",
            "description": "Australian suburb intelligence. Data-driven insights to help you find the perfect place to live, invest, or rent.",
            "publisher": {
              "@type": "Organization",
              "name": "SuburbSense",
              "logo": {
                "@type": "ImageObject",
                "url": "https://suburbsense.com.au/logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://suburbsense.com.au/suburb/{search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SuburbSense",
            "url": "https://suburbsense.com.au",
            "logo": "https://suburbsense.com.au/logo.png",
            "description": "Australian suburb intelligence platform providing data-driven insights for property research",
            "sameAs": [
              "https://twitter.com/suburbsense",
              "https://facebook.com/suburbsense",
              "https://linkedin.com/company/suburbsense"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "contact@suburbsense.com.au",
              "contactType": "customer service"
            }
          })}
        </script>

        <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 Free Australian Suburb Intelligence</div>
          <h1 className="hero-title">
            Find Your Perfect Australian Suburb to <span style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live, Invest & Thrive</span>
          </h1>
          <p className="hero-subtitle">
            Uncover data-driven insights with real ABS census data, ACARA school ratings, transit scores & cost-of-living tools — <strong>all free, no login required</strong>
          </p>
          
           <div className="hero-metrics">
            <div className="hero-metric">
              <span className="metric-number">11,599</span>
              <span className="metric-label">Australian Suburbs</span>
            </div>
            <div className="hero-metric">
              <span className="metric-number">30+</span>
              <span className="metric-label">Energy Retailers</span>
            </div>
            <div className="hero-metric">
              <span className="metric-number">100%</span>
              <span className="metric-label">Free & No Login</span>
            </div>
          </div>
          
           <div className="search-box">
            <SuburbSearch onSelect={handleSuburbSelect} placeholder="Search a suburb, region or postcode..." />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>Powered by ABS Census 2021 · ACARA Schools · OpenStreetMap · AER Energy Data</p>
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🗺️ Explore Popular Regions</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
                {[
                  { name: 'Sydney', slug: 'greater-sydney', emoji: '🌉', sub: 'NSW' },
                  { name: 'Melbourne', slug: 'greater-melbourne', emoji: '🏙️', sub: 'VIC' },
                  { name: 'Brisbane', slug: 'greater-brisbane', emoji: '☀️', sub: 'QLD' },
                  { name: 'Adelaide', slug: 'greater-adelaide', emoji: '🌿', sub: 'SA' },
                  { name: 'Perth', slug: 'greater-perth', emoji: '🌊', sub: 'WA' },
                  { name: 'Hobart', slug: 'greater-hobart', emoji: '🏔️', sub: 'TAS' },
                ].map(r => (
                  <Link key={r.slug} to={`/region/${r.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--surface-alt)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={e => { 
                    e.currentTarget.style.borderColor = 'var(--primary-color)'; 
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                  }}
                  onMouseOut={e => { 
                    e.currentTarget.style.borderColor = 'var(--border-color)'; 
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{r.emoji}</span>
                    <span>{r.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{r.sub}</span></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {selectedSuburb && (
            <div className="selected-suburb">
              {selectedSuburb.is_region ? (
                <>
                  <h3>Selected Region: {selectedSuburb.name}, {selectedSuburb.state}</h3>
                  <p>Click <Link to={`/region/${selectedSuburb.slug}`} className="btn btn-primary">View Region Guide</Link> to explore suburbs</p>
                </>
              ) : (
                <>
                  <h3>Selected: {selectedSuburb.name}, {selectedSuburb.state} {selectedSuburb.postcode}</h3>
                  <p>Click <Link to={`/suburb/${selectedSuburb.slug}`} className="btn btn-primary">View Detailed Profile</Link> to explore calculators and data</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <GlobalMarketPulse />

      <SuburbLibraryRails />

      {/* How It Works */}
      <section style={{ padding: '3.5rem 0 3rem', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>How it works</p>
          <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '2.5rem', fontSize: '1.5rem' }}>Find your perfect suburb in 3 steps</h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap' }}>
            {[
              { step: '1', icon: '🔍', title: 'Search any suburb', desc: 'Type a suburb, region or postcode into the search bar above' },
              { step: '2', icon: '📊', title: 'See real data', desc: 'Demographics, schools, safety, transit scores and more' },
              { step: '3', icon: '💡', title: 'Compare & decide', desc: 'Use our free calculators to plan your move or investment' },
            ].map((s, i) => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', flex: '1 1 200px', maxWidth: '280px' }}>
                <div style={{ textAlign: 'center', padding: '1rem', position: 'relative', flex: 1 }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}>{s.icon}</div>
                  <div style={{
                    position: 'absolute', top: '32px', right: '-50%', width: '100%', height: '2px',
                    background: 'linear-gradient(90deg, var(--primary-color), var(--border-color))',
                    zIndex: 0, display: i < 2 ? 'block' : 'none',
                  }} />
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-primary)', position: 'relative', zIndex: 1 }}>{s.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guides-hub" style={{ padding: '4rem 0', background: 'var(--surface-alt)' }}>
        <div className="section-header">
          <h2>Discover Suburb Guides</h2>
          <p>Explore our data-driven rankings for the best suburbs across Australia.</p>
        </div>
        <div className="calculator-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <a href="/guides/vic/families" className="calculator-card featured reveal-stagger">
            <div className="calculator-icon">👨‍👩‍👧‍👦</div>
            <div className="calculator-info">
              <h3>Best for Families (VIC)</h3>
              <p>Top suburbs ranked by school quality, safety, and parks.</p>
            </div>
          </a>
          <a href="/guides/nsw/commuters" className="calculator-card featured reveal-stagger">
            <div className="calculator-icon">🚆</div>
            <div className="calculator-info">
              <h3>Best for Commuters (NSW)</h3>
              <p>Top suburbs ranked by transit access and CBD proximity.</p>
            </div>
          </a>
          <a href="/guides/qld/safest" className="calculator-card featured reveal-stagger">
            <div className="calculator-icon">🛡️</div>
            <div className="calculator-info">
              <h3>Safest Suburbs (QLD)</h3>
              <p>Top suburbs ranked by low crime rates and community safety.</p>
            </div>
          </a>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/state/vic" className="btn btn-secondary" style={{ margin: '0 0.5rem' }}>Explore VIC</a>
          <a href="/state/nsw" className="btn btn-secondary" style={{ margin: '0 0.5rem' }}>Explore NSW</a>
          <a href="/state/qld" className="btn btn-secondary" style={{ margin: '0 0.5rem' }}>Explore QLD</a>
        </div>
      </section>

       <section className="calculators-hub">
         <div className="section-header">
           <h2>Powerful Decision Tools</h2>
           <p>Make informed decisions with our comprehensive suite of property calculators. For renters comparing suburbs, first home buyers checking eligibility, and investors analyzing returns.</p>
         </div>
         <div className="calculator-grid">
          <a href="/calculators/affordability" className="calculator-card featured reveal-stagger">
            <div className="calculator-icon">💰</div>
            <div className="calculator-info">
              <h3>Can I Afford This Suburb?</h3>
              <p>Given your income and deposit — what's the maximum you can borrow? What will it actually cost each month?</p>
            </div>
          </a>
           <a href="/calculators/stamp-duty" className="calculator-card featured reveal-stagger">
              <div className="calculator-icon">🏠</div>
              <div className="calculator-info">
                <h3>True Upfront Cost</h3>
                <p>Stamp duty + transfer fees + mortgage registration + LMI. All government costs in one result.</p>
              </div>
            </a>
            <a href="/calculators/roi" className="calculator-card featured reveal-stagger">
              <div className="calculator-icon">📈</div>
              <div className="calculator-info">
                <h3>Is It a Good Investment?</h3>
                <p>Net yield, cash-on-cash return, weekly cashflow. After ALL costs — rates, strata, land tax, maintenance.</p>
              </div>
            </a>
            <a href="/fhbg" className="calculator-card reveal-stagger">
              <div className="calculator-icon">🏡</div>
              <div className="calculator-info">
                <h3>First Home Guarantee Eligibility</h3>
                <p>Can you use the 5% deposit scheme? No LMI, no income cap, unlimited places.</p>
              </div>
            </a>
            <a href="/land-tax" className="calculator-card reveal-stagger">
              <div className="calculator-icon">📋</div>
              <div className="calculator-info">
                <h3>Annual Land Tax</h3>
                <p>Estimate land tax for investment properties. Includes foreign owner surcharge.</p>
              </div>
            </a>
            <a href="/council-rates" className="calculator-card reveal-stagger">
              <div className="calculator-icon">🏛️</div>
              <div className="calculator-info">
                <h3>Council Rates</h3>
                <p>Estimate annual council rates for any property. Varies significantly by council area.</p>
              </div>
            </a>
            <a href="/energy/compare" className="calculator-card reveal-stagger" style={{ opacity: '0.9' }}>
              <div className="calculator-icon">⚡</div>
              <div className="calculator-info">
                <h3>Compare Your Energy <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Coming Soon</span></h3>
                <p>Moving? Join the waitlist for our upcoming electricity and gas comparison tool.</p>
              </div>
            </a>
            <a href="/nbn" className="calculator-card reveal-stagger">
              <div className="calculator-icon">📶</div>
              <div className="calculator-info">
                <h3>NBN Technology Check</h3>
                <p>FTTP, HFC, FTTN? Check what's available at any address before you buy.</p>
              </div>
            </a>
         </div>
      </section>

       <section className="features">
         <div className="section-header">
           <h2>Comprehensive Suburb Profiles</h2>
           <p>Detailed suburb profiles with school catchments, transit access, and ABS census demographics — everything you need when comparing suburbs.</p>
         </div>
         <div className="feature-grid">
            <div className="feature-card reveal-stagger">
              <div className="feature-icon">🏫</div>
              <h3>Which School Zone Am I In?</h3>
              <p>Official government school intake zones. Primary and secondary catchments for every suburb with ACARA school ratings.</p>
            </div>
            <div className="feature-card reveal-stagger">
              <div className="feature-icon">🚌</div>
              <h3>How Long Will My Commute Actually Be?</h3>
              <p>Real GTFS data from PTV, TfNSW, TransLink, Adelaide Metro, Transperth. Stop density scored 0-100.</p>
            </div>
            <div className="feature-card reveal-stagger">
              <div className="feature-icon">🌳</div>
              <h3>What's the Liveability Like?</h3>
              <p>Parks coverage, nearest hospital, supermarket access, amenities count — all in one place.</p>
            </div>
            <div className="feature-card reveal-stagger">
              <div className="feature-icon">📊</div>
              <h3>Who Lives Here? (ABS Census)</h3>
              <p>ABS Census 2021 — population, median income, median age, owner-occupancy, and more.</p>
            </div>
          </div>
      </section>

       <section className="calculators-hub reveal-up" style={{ background: 'transparent', border: 'none', padding: '2rem 0' }}>
         <div className="section-header">
           <h2>Moving? Compare Your Utilities</h2>
           <p>Free comparison tool for electricity, gas, and internet. No lock-in. No obligation. Save on your utilities today.</p>
         </div>
        <div className="calculator-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <a href="/energy/compare" className="calculator-card reveal-stagger" style={{ opacity: '0.9' }}>
            <div className="calculator-icon">⚡</div>
            <div className="calculator-info">
              <h3>Compare Energy Plans <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Coming Soon</span></h3>
              <p>Electricity and gas from 30+ retailers. Join the waitlist for early access.</p>
            </div>
          </a>
          <a href="/nbn" className="calculator-card reveal-stagger">
            <div className="calculator-icon">📶</div>
            <div className="calculator-info">
              <h3>Internet Availability</h3>
              <p>Check NBN tech type at your new address. FTTP, HFC, FTTN and more.</p>
            </div>
          </a>
        </div>
      </section>

       <section className="data-sources">
        <div className="section-header">
          <h2>Data Sources</h2>
          <p>All information is derived from publicly available government and community data</p>
        </div>
        <div className="source-list">
          <div className="source-item">
            <span className="source-label">Australian Bureau of Statistics (ABS)</span>
            <span className="source-tag">2021 Census</span>
          </div>
          <div className="source-item">
            <span className="source-label">Australian Curriculum, Assessment and Reporting Authority (ACARA)</span>
            <span className="source-tag">School Ratings</span>
          </div>
          <div className="source-item">
            <span className="source-label">OpenStreetMap contributors</span>
            <span className="source-tag">Map Data</span>
          </div>
          <div className="source-item">
            <span className="source-label">CHOICE</span>
            <span className="source-tag">March 2026 Survey</span>
          </div>
          <div className="source-item">
            <span className="source-label">Australian Energy Regulator (AER)</span>
            <span className="source-tag">Reference Prices</span>
          </div>
          <div className="source-item">
            <span className="source-label">Community Contributors</span>
            <span className="source-tag">Price Observations</span>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

const getSchoolGrade = (icsea) => {
  if (!icsea) return { grade: 'N/A', color: 'var(--text-light)' };
  if (icsea >= 1150) return { grade: 'A+', color: '#2ecc71' };
  if (icsea >= 1100) return { grade: 'A', color: '#27ae60' };
  if (icsea >= 1050) return { grade: 'B+', color: '#3498db' };
  if (icsea >= 1000) return { grade: 'B', color: '#2980b9' };
  if (icsea >= 950) return { grade: 'C+', color: '#f1c40f' };
  if (icsea >= 900) return { grade: 'C', color: '#f39c12' };
  return { grade: 'D', color: '#e74c3c' };
};

function SuburbProfile() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSchoolZone, setSelectedSchoolZone] = useState(null);
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/suburbs/${slug}`);
        if (!response.ok) {
          throw new Error('Suburb not found');
        }
        const result = await response.json();
        setData(result);
        recordRecentVisit({
          slug: result.slug,
          name: result.name,
          state: result.state,
          postcode: result.postcode,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading suburb profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const scores = data.scores || {};
  const compositeScore = Math.round(
    (scores.schools * 0.25) +
    (scores.transit * 0.25) +
    (scores.accessibility * 0.2) +
    (scores.parks * 0.15) +
    (scores.shopping * 0.1) +
    (scores.health * 0.05)
  );

  const scoreLabel = (s) => {
    if (s >= 85) return { text: 'Excellent', color: '#10b981' };
    if (s >= 70) return { text: 'Good', color: '#3b82f6' };
    if (s >= 50) return { text: 'Average', color: '#f59e0b' };
    if (s >= 30) return { text: 'Below Avg', color: '#ef4444' };
    return { text: 'Limited', color: '#6b7280' };
  };

  const overallLabel = scoreLabel(compositeScore);
  const schoolLabel = scoreLabel(scores.schools);
  const transitLabel = scoreLabel(scores.transit);

  const medianIncome = data.demographics?.predominant_income_band || '';
  const isWeekly = medianIncome.includes('/yr') || medianIncome.startsWith('$');
  const isHighIncome = isWeekly
    ? medianIncome.includes('$2,500') || medianIncome.includes('$3,000') || medianIncome.includes('$3,500') || medianIncome.includes('$4,000')
    : medianIncome.includes('130-182K') || medianIncome.includes('182K');
  const isLowIncome = isWeekly
    ? medianIncome.includes('Nil') || medianIncome.includes('$1-$149') || medianIncome.includes('$150-$299')
    : medianIncome.includes('0-15.6K') || medianIncome.includes('15.6-33.8K');

  const strengths = [];
  const tradeoffs = [];

  if (scores.schools >= 70) strengths.push({ icon: '🏫', text: `Strong school quality (ICSEA ${Math.round(data.education?.avg_icsea || 0)})` });
  if (scores.transit >= 60) strengths.push({ icon: '🚆', text: `Good public transport (${data.transport?.transit_count || 0} transit stops)` });
  if (data.demographics?.owner_occupier_rate >= 60) strengths.push({ icon: '🏠', text: `High owner-occupancy (${data.demographics.owner_occupier_rate}%)` });
  if (data.transport?.cbd_distance_mins <= 20) strengths.push({ icon: '📍', text: `Only ${data.transport.cbd_distance_mins} min to CBD` });
  if (isHighIncome) strengths.push({ icon: '💎', text: `Above-average household income` });
  if (scores.parks >= 50) strengths.push({ icon: '🌳', text: `Good park coverage (${data.environment?.parks_count || 0} parks)` });

  if (data.transport?.cbd_distance_mins > 40) tradeoffs.push({ icon: '🚗', text: `Longer commute (${data.transport.cbd_distance_mins} min to CBD)` });
  if (scores.transit < 40) tradeoffs.push({ icon: '🚌', text: `Limited public transport` });
  if (data.demographics?.avg_icsea < 950 && data.education?.school_count > 0) tradeoffs.push({ icon: '📊', text: `School ICSEA below national average (1000)` });
  if (isLowIncome) tradeoffs.push({ icon: '💰', text: `Below-median household income` });
  if (data.demographics?.owner_occupier_rate < 40) tradeoffs.push({ icon: '🏘️', text: `Predominantly rental area` });

  const incomeDesc = isHighIncome ? 'above the state median' : isLowIncome ? 'below the state median' : 'around the state median';
  const cbdCity = data.transport?.metro_cbd || 'CBD';

  const suburbSummary = `${data.name} is a ${data.community_profile?.life_stage?.toLowerCase() || 'mixed'} suburb in ${data.state}, located ${data.transport?.cbd_distance_mins || 'N/A'}km from ${cbdCity}. School quality is ${data.education?.school_quality || 'rated'} (avg ICSEA ${Math.round(data.education?.avg_icsea || 0)}). ${data.transport?.transit_count > 50 ? 'Public transport is well-served with numerous transit options nearby.' : data.transport?.transit_count > 15 ? 'Public transport is available with moderate coverage.' : 'Public transport is limited — a car is recommended.'}`;

  const faqData = [
    { q: `Is ${data.name} a good suburb?`, a: `${data.name} has an overall liveability score of ${compositeScore}/100. ${schoolLabel.text} school quality (score: ${scores.schools}/100), ${transitLabel.text.toLowerCase()} transit (score: ${scores.transit}/100). ${strengths.length > 0 ? 'Key strengths: ' + strengths.slice(0, 3).map(s => s.text).join(', ') + '.' : ''}` },
    { q: `What is the median income in ${data.name}?`, a: `The predominant ${isWeekly ? 'weekly' : 'annual'} household income band in ${data.name} is ${medianIncome || 'N/A'}. This is ${incomeDesc}.` },
    { q: `What schools are in ${data.name}?`, a: `${data.name} has ${data.education?.school_count || 0} schools including ${data.education?.schools?.filter(s => s.type === 'Primary').length || 0} primary and ${data.education?.schools?.filter(s => s.type === 'Secondary').length || 0} secondary schools. Average ICSEA: ${Math.round(data.education?.avg_icsea || 0)}. School data: ACARA 2025 — updated annually.` },
    { q: `Can I get the First Home Owner Grant in ${data.name}?`, a: `The First Home Guarantee (FHBG) eligibility is based on property price caps that vary by state and postcode. ${data.name}, ${data.state} ${data.postcode} has specific price caps. Check the FHBG calculator for your situation.` },
    { q: `What is public transport like in ${data.name}?`, a: `${data.name} has a transit score of ${scores.transit}/100. There are ${data.transport?.bus_stops || 0} bus stops, ${data.transport?.tram_stops || 0} tram stops, and ${data.transport?.train_stations || 0} train stations nearby. ${scores.transit >= 60 ? 'Public transport is a viable option for commuting.' : scores.transit >= 30 ? 'Public transport is available but limited.' : 'A car is strongly recommended due to limited public transport.'}` },
    { q: `Is ${data.name} good for families?`, a: `${data.name} has a "${data.community_profile?.vibe || 'Mixed'}" community vibe with ${data.demographics?.predominant_household || 'mixed'} households. ${scores.schools >= 70 ? 'School quality is a strength.' : 'School quality is average.'} ${data.environment?.parks_count > 30 ? `With ${data.environment.parks_count} parks, green space is plentiful.` : 'Park coverage is limited.'} ${data.demographics?.median_age < 35 ? 'The area skews younger, popular with young families.' : data.demographics?.median_age > 45 ? 'The area has an established, mature community.' : 'The age demographic is mixed.'}` },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const suburbPlaceSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${data.name}, ${data.state} ${data.postcode}`,
    "description": suburbSummary,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.name,
      "addressRegion": data.state,
      "postalCode": data.postcode,
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.coordinates.lat,
      "longitude": data.coordinates.lng
    }
  };



  return (
    <div className="container">
      <Helmet>
        <title>{`${data.name} ${data.state} ${data.postcode} — Schools, Transit & Data | SuburbSense`}</title>
        <meta name="description" content={`${data.name} suburb profile — schools (ICSEA ${Math.round(data.education?.avg_icsea || 0)}), transit score ${scores.transit}/100, stamp duty calculator, ABS demographics ${data.demographics?.population_2021 ? `pop ${data.demographics.population_2021.toLocaleString()}` : ''}. Free.`} />
        <link rel="canonical" href={`https://suburbsense.com.au/suburb/${data.slug}`} />
        <meta property="og:title" content={`${data.name} ${data.state} ${data.postcode} — SuburbSense`} />
        <meta property="og:description" content={suburbSummary} />
        <meta property="og:type" content="place" />
        <meta property="og:url" content={`https://suburbsense.com.au/suburb/${data.slug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(suburbPlaceSchema)}</script>
      </Helmet>

      <div className="hero-dashboard" role="region" aria-label="Suburb Overview">
        <div className="hero-breadcrumb">
          <Link to="/" aria-label="Home">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{data.name}, {data.state} {data.postcode}</span>
        </div>
        
        <div className="hero-main">
          <div className="hero-content">
            <div className="hero-header">
              <h1 className="hero-title">{data.name}, {data.state} {data.postcode}</h1>
              <div className="hero-actions">
                <SaveSuburbButton
                  suburb={{ slug: data.slug, name: data.name, state: data.state, postcode: data.postcode, score: compositeScore }}
                />
                <SuburbAlertSignup suburb={{ slug: data.slug, name: data.name, state: data.state }} />
              </div>
            </div>
            
            <p className="hero-subtitle">{suburbSummary}</p>
            
            <div className="hero-badges" role="list" aria-label="Key statistics">
              {data.demographics?.population_2021 && (
                <div className="hero-badge" role="listitem">
                  <span className="hero-badge-icon">📍</span>
                  <span className="hero-badge-text">{data.demographics.population_2021.toLocaleString()} Pop</span>
                </div>
              )}
              {data.transport?.cbd_distance_mins && (
                <div className="hero-badge" role="listitem">
                  <span className="hero-badge-icon">🚗</span>
                  <span className="hero-badge-text">{data.transport.cbd_distance_mins} min to CBD</span>
                </div>
              )}
              {data.demographics?.median_age && (
                <div className="hero-badge" role="listitem">
                  <span className="hero-badge-icon">👥</span>
                  <span className="hero-badge-text">Avg Age {data.demographics.median_age}</span>
                </div>
              )}
              {data.demographics?.owner_occupier_rate && (
                <div className="hero-badge" role="listitem">
                  <span className="hero-badge-icon">🏠</span>
                  <span className="hero-badge-text">{data.demographics.owner_occupier_rate}% Own</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="hero-score-widget" role="complementary" aria-label="Overall livability score">
            <div className="hero-score-ring" style={{ '--ring-color': overallLabel.color, '--ring-pct': compositeScore }}>
              <div className="hero-score-inner">
                <span className="hero-score-value">{compositeScore}</span>
                <span className="hero-score-max">/100</span>
              </div>
            </div>
            <div className="hero-score-label" style={{ color: overallLabel.color }}>Overall Score</div>
          </div>
        </div>
      </div>

      <div className="suburb-actions" role="region" aria-label="Quick actions">
        <a href={`/energy/compare?suburb=${data.slug}&state=${data.state}`} className="btn btn-primary">
          Compare Energy Plans
        </a>
        <a href={`/energy/compare?suburb=${data.slug}&state=${data.state}&vertical=internet`} className="btn btn-secondary">
          Compare Internet
        </a>
        <a href={`/calculators/stamp-duty?state=${data.state}&postcode=${data.postcode}`} className="btn btn-secondary">
          Stamp Duty Calc
        </a>
      </div>

      <nav className="sticky-sub-nav" role="navigation" aria-label="Suburb profile sections" tabIndex="0">
        <div className="sticky-sub-nav-content">
          <a href="#quick-facts" className="sticky-sub-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('quick-facts')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Overview</a>
          <a href="#demographics" className="sticky-sub-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('demographics')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Demographics</a>
          <a href="#education" className="sticky-sub-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('education')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Education</a>
          <a href="#amenities" className="sticky-sub-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Amenities</a>
          <a href="#calculators" className="sticky-sub-nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Calculators</a>
        </div>
      </nav>

      <section id="quick-facts" className="quick-facts-section reveal-up" role="region" aria-label="Quick facts">
        <h2 className="section-title">Quick Facts</h2>
        <div className="quick-facts-grid" role="list">
          {data.demographics?.population_density && (
            <div className="quick-fact-card reveal-stagger" role="listitem">
              <span className="quick-fact-icon" aria-hidden="true">🏙️</span>
              <div className="quick-fact-info">
                <span className="quick-fact-value">{Math.round(data.demographics.population_density).toLocaleString()}/km²</span>
                <span className="quick-fact-label">Population Density</span>
              </div>
            </div>
          )}
          {data.demographics?.predominant_occupation && (
            <div className="quick-fact-card" role="listitem">
              <span className="quick-fact-icon" aria-hidden="true">💼</span>
              <div className="quick-fact-info">
                <span className="quick-fact-value">{data.demographics.predominant_occupation}</span>
                <span className="quick-fact-label">Top Occupation</span>
              </div>
            </div>
          )}
          {data.demographics?.typical_mortgage_band && (
            <div className="quick-fact-card" role="listitem">
              <span className="quick-fact-icon" aria-hidden="true">🏦</span>
              <div className="quick-fact-info">
                <span className="quick-fact-value">{data.demographics.typical_mortgage_band}</span>
                <span className="quick-fact-label">Typical Mortgage</span>
              </div>
            </div>
          )}
          {data.demographics?.population_cagr && (
            <div className="quick-fact-card">
              <span className="quick-fact-icon">📈</span>
              <div className="quick-fact-info">
                <span className="quick-fact-value">{data.demographics.population_cagr > 0 ? '+' : ''}{data.demographics.population_cagr.toFixed(1)}%</span>
                <span className="quick-fact-label">Annual Growth</span>
              </div>
            </div>
          )}
        </div>
      </section>

        <div className="suburb-content">
          <section id="map" className="map-section" ref={mapRef}>
          <h2 className="section-title">
            {selectedSchoolZone ? `Catchment: ${selectedSchoolZone.name}` : 'Location, Schools & Transit'}
          </h2>
          <React.Suspense fallback={<div className="map-placeholder" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>Loading map interactives...</div>}>
            <AmenityMap
              center={data.coordinates}
              amenities={data.amenities.per_category}
              boundary={data.boundary}
              schools={data.education.schools}
              transitStops={data.transit_stops}
              schoolZone={selectedSchoolZone}
              religions={data.amenities.per_category?.religion || []}
              onMarkerClick={(marker) => {
                if (marker.category && marker.category.startsWith('school')) {
                  const catchment = data.school_catchments?.find(c => c.name === marker.name);
                  if (catchment && catchment.zone_geojson) {
                    setSelectedSchoolZone({
                      name: catchment.name,
                      type: catchment.type,
                      geojson: catchment.zone_geojson
                    });
                    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            />
          </React.Suspense>
        </section>

        {(strengths.length > 0 || tradeoffs.length > 0) && (
          <section id="strengths" className="strengths-tradeoffs-section">
            <h2 className="section-title">Strengths & Trade-offs</h2>
            <div className="strengths-tradeoffs-grid">
              {strengths.length > 0 && (
                <div className="strengths-card">
                  <h3>✅ Strengths</h3>
                  <ul>
                    {strengths.map((s, i) => (
                      <li key={i}><span className="strength-icon">{s.icon}</span>{s.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tradeoffs.length > 0 && (
                <div className="tradeoffs-card">
                  <h3>⚠️ Trade-offs</h3>
                  <ul>
                    {tradeoffs.map((t, i) => (
                      <li key={i}><span className="strength-icon">{t.icon}</span>{t.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <section id="transit" className="transit-section">
          <h2 className="section-title">Getting Around</h2>
          <div className="transit-grid">
            {data.transport?.nearest_train?.length > 0 && (
              <div className="transit-card">
                <span className="transit-icon">🚆</span>
                <div className="transit-info">
                  <span className="transit-label">Nearest Train Station</span>
                  <span className="transit-value">{data.transport.nearest_train[0].name}</span>
                  {data.transport.nearest_train[0].distance_km > 0 && (
                    <span className="transit-distance">{data.transport.nearest_train[0].distance_km} km away</span>
                  )}
                </div>
              </div>
            )}
            {(data.transport?.bus_routes > 0 || data.transport?.tram_routes > 0 || data.transport?.ferry_terminals > 0) && (
              <div className="transit-card">
                <span className="transit-icon">🚌</span>
                <div className="transit-info">
                  <span className="transit-label">Route Diversity</span>
                  <span className="transit-value">
                    {data.transport?.bus_routes > 0 && `${data.transport.bus_routes} bus`}
                    {data.transport?.bus_routes > 0 && data.transport?.tram_routes > 0 && ' · '}
                    {data.transport?.tram_routes > 0 && `${data.transport.tram_routes} tram`}
                    {data.transport?.ferry_terminals > 0 && ` · ${data.transport.ferry_terminals} ferry`}
                  </span>
                  <span className="transit-distance">routes serviced</span>
                </div>
              </div>
            )}
            {data.transport?.road_score > 0 && (
              <div className="transit-card">
                <span className="transit-icon">🛣️</span>
                <div className="transit-info">
                  <span className="transit-label">Road Access</span>
                  <span className="transit-value">{data.transport.road_score}/100</span>
                  {data.transport?.nearest_motorway_km > 0 && (
                    <span className="transit-distance">{data.transport.nearest_motorway_km} km to motorway</span>
                  )}
                </div>
              </div>
            )}
            {data.transport?.combined_accessibility > 0 && (
              <div className="transit-card">
                <span className="transit-icon">🎯</span>
                <div className="transit-info">
                  <span className="transit-label">Accessibility</span>
                  <span className="transit-value">{data.transport.combined_accessibility}/100</span>
                  <span className="transit-distance">combined score</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {data.nearby_suburbs && data.nearby_suburbs.length > 0 && (
          <section className="nearby-suburbs-section">
            <h2 className="section-title">Nearby Suburbs</h2>
            <div className="nearby-suburbs-grid">
              {data.nearby_suburbs.map((sub, idx) => {
                const subSlug = `${sub.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace(/,/g, '')}-${sub.state.toLowerCase()}-${sub.postcode}`;
                return (
                  <Link key={idx} to={`/suburb/${subSlug}`} className="nearby-suburb-card">
                    <span className="nearby-suburb-name">{sub.name}</span>
                    <span className="nearby-suburb-postcode">{sub.state} {sub.postcode}</span>
                  </Link>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to={`/state/${data.state.toLowerCase()}`} className="btn btn-secondary">
                Explore all {data.state} suburbs →
              </Link>
            </div>
          </section>
        )}

        <section id="scores" className="score-section">
          <h2 className="section-title">Detailed Scores</h2>
          <ScoreChips scores={{...data.scores, safety: data.environment?.safety_score}} />
          {data.environment?.crime_rate && (
            <p className="stat-desc" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <strong>Safety Note:</strong> Reported incident rate is {Math.round(data.environment.crime_rate)} per 100k residents/yr.
            </p>
          )}
        </section>

        {data.community_profile && (
          <section id="community" className="community-section">
            <h2 className="section-title">Community & Lifestyle</h2>
            <p className="community-description">{data.community_profile.description}</p>
            <div className="community-tags-grid">
              <div className="community-tag-card">
                <span className="community-tag-icon">🏠</span>
                <div className="community-tag-info">
                  <span className="community-tag-label">Vibe</span>
                  <span className="community-tag-value">{data.community_profile.vibe}</span>
                </div>
              </div>
              <div className="community-tag-card">
                <span className="community-tag-icon">🌳</span>
                <div className="community-tag-info">
                  <span className="community-tag-label">Roots</span>
                  <span className="community-tag-value">{data.community_profile.roots}</span>
                </div>
              </div>
              <div className="community-tag-card">
                <span className="community-tag-icon">👥</span>
                <div className="community-tag-info">
                  <span className="community-tag-label">Life Stage</span>
                  <span className="community-tag-value">{data.community_profile.life_stage}</span>
                </div>
              </div>
              <div className="community-tag-card">
                <span className="community-tag-icon">💎</span>
                <div className="community-tag-info">
                  <span className="community-tag-label">Affluence</span>
                  <span className="community-tag-value">{data.community_profile.affluence}</span>
                </div>
              </div>
            </div>
          </section>
        )}


        <section id="energy" className="energy-cta-section">
          <div className="energy-cta-card">
            <h3>Compare Energy Plans in {data.name}</h3>
            <p>Moving to {data.name}? We're building a new comparison tool to find the best electricity and gas plans.</p>
            <a href={`/energy/compare?suburb=${data.slug}&state=${data.state}`} className="btn btn-primary">
              Join the Waitlist →
            </a>
          </div>
        </section>

        <section id="demographics" className="demographics-dashboard">
          <h2 className="section-title">Who Lives Here?</h2>
          <div className="demographics-grid">
            
            <div className="demo-card">
              <div className="demo-card-header">
                <h3>Vibe & Lifestyle</h3>
                <span className="demo-icon">✨</span>
              </div>
              <div className="demo-lifestyle-content">
                <p><strong>{data.name}</strong> is a <strong>{data.community_profile?.vibe || 'mixed'}</strong> community, predominantly made up of <strong>{data.demographics?.predominant_household || 'various household types'}</strong>.</p>
                <div className="demo-key-stats">
                  <div className="demo-stat">
                    <span className="stat-label">Average Household</span>
                    <span className="stat-val">{data.demographics?.average_household_size || 'N/A'} people</span>
                  </div>
                  <div className="demo-stat">
                    <span className="stat-label">Investor Rate</span>
                    <span className="stat-val">{data.demographics?.investor_rate || 'N/A'}%</span>
                  </div>
                  <div className="demo-stat">
                    <span className="stat-label">Median Age</span>
                    <span className="stat-val">{data.demographics?.median_age || 'N/A'} yrs</span>
                  </div>
                  {data.demographics?.predominant_occupation && (
                    <div className="demo-stat">
                      <span className="stat-label">Top Occupation</span>
                      <span className="stat-val">{data.demographics.predominant_occupation}</span>
                    </div>
                  )}
                  {data.demographics?.typical_mortgage_band && (
                    <div className="demo-stat">
                      <span className="stat-label">Typical Mortgage</span>
                      <span className="stat-val">{data.demographics.typical_mortgage_band}/mo</span>
                    </div>
                  )}
                  {data.demographics?.population_cagr != null && (
                    <div className="demo-stat">
                      <span className="stat-label">Population Growth</span>
                      <span className="stat-val">{data.demographics.population_cagr.toFixed(1)}% CAGR</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {data.demographics?.income_distribution && Object.keys(data.demographics.income_distribution).length > 0 && (() => {
              const bands = Object.keys(data.demographics.income_distribution);
              const isWeekly = bands.some(b => b.includes('/yr') || b.startsWith('$'));
              const weeklyOrder = ['Nil/Negative/yr','$1-$149/yr','$150-$299/yr','$300-$399/yr','$400-$499/yr','$500-$649/yr','$650-$799/yr','$800-$999/yr','$1,000-$1,249/yr','$1,250-$1,499/yr','$1,500-$1,749/yr','$1,750-$1,999/yr','$2,000-$2,499/yr','$2,500-$2,999/yr','$3,000-$3,499/yr','$3,500-$3,999/yr','$4,000+/yr'];
              const annualOrder = ['0-15.6K','15.6-33.8K','33.8-52K','52-78K','78-130K','130-182K','182K+'];
              const order = isWeekly ? weeklyOrder : annualOrder;
              return (
              <div className="demo-card">
                <div className="demo-card-header">
                  <h3>{isWeekly ? 'Weekly' : 'Annual'} Household Income</h3>
                  <span className="demo-icon">💰</span>
                </div>
                <div className="income-chart">
                  {Object.entries(data.demographics.income_distribution)
                    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
                    .map(([band, pct]) => (
                      <div key={band} className="income-bar-row compact">
                        <span className="income-label">{isWeekly ? band.replace('/yr', '') : band}</span>
                        <div className="income-bar-container">
                          <div className="income-bar" style={{
                            width: `${Math.min(100, pct * 2)}%`,
                            backgroundColor: band === data.demographics.predominant_income_band ? '#2563eb' : '#bfdbfe'
                          }} />
                        </div>
                        <span className="income-pct">{pct}%</span>
                      </div>
                    ))}
                </div>
              </div>
              );
            })()}

            {data.demographics?.age_distribution && Object.keys(data.demographics.age_distribution).length > 0 && (
              <div className="demo-card">
                <div className="demo-card-header">
                  <h3>Age Distribution</h3>
                  <span className="demo-icon">🎂</span>
                </div>
                <div className="income-chart">
                  {Object.entries(data.demographics.age_distribution)
                    .sort((a, b) => {
                      const order = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99', '100+'];
                      return order.indexOf(a[0]) - order.indexOf(b[0]);
                    })
                    .map(([band, pct]) => (
                      <div key={band} className="income-bar-row compact">
                        <span className="income-label">{band} yrs</span>
                        <div className="income-bar-container">
                          <div className="income-bar" style={{
                            width: `${Math.min(100, pct * 2)}%`,
                            backgroundColor: band === data.demographics.predominant_age_group ? '#2563eb' : '#bfdbfe'
                          }} />
                        </div>
                        <span className="income-pct">{pct}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {(data.demographics?.dwelling_structure || data.demographics?.travel_to_work) && (
              <div className="abs-extra-stats">
                {data.demographics?.dwelling_structure && (
                  <div className="demo-card">
                    <div className="demo-card-header">
                      <h3>Dwelling Structure</h3>
                      <span className="demo-icon">🏘️</span>
                    </div>
                    <div className="mini-bar-chart">
                      {Object.entries(data.demographics.dwelling_structure)
                        .filter(([k, v]) => v > 0)
                        .map(([type, pct]) => (
                        <div key={type} className="mini-bar-row">
                          <span className="mini-bar-label">{type}</span>
                          <div className="mini-bar-container">
                            <div className="mini-bar" style={{ width: `${pct}%`, backgroundColor: type === 'House' ? '#10b981' : type === 'Townhouse' ? '#f59e0b' : '#3b82f6' }} />
                          </div>
                          <span className="mini-bar-val">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.demographics?.travel_to_work && (
                  <div className="demo-card">
                    <div className="demo-card-header">
                      <h3>Travel to Work</h3>
                      <span className="demo-icon">🚗</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '-10px', marginBottom: '12px' }}>
                      * 2021 Census data was impacted by COVID-19 lockdowns, resulting in higher WFH figures.
                    </p>
                    <div className="travel-pills">
                      {Object.entries(data.demographics.travel_to_work)
                        .filter(([k, v]) => v > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([method, pct]) => (
                        <div key={method} className="travel-pill">
                          <span className="travel-pill-val">{pct}%</span>
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
          <p className="abs-source">Source: ABS Census 2021</p>
        </section>

        <section id="calculators" className="calculator-cta-section">
          <h2 className="section-title">Calculate Your Costs</h2>
          <div className="calculator-cta-grid">
            <a href={`/calculators/stamp-duty?state=${data.state}&postcode=${data.postcode}`} className="calculator-cta-card">
              <span className="cta-icon">🏠</span>
              <div>
                <strong>Stamp Duty Calculator</strong>
                <p>Estimate stamp duty and government fees for this purchase.</p>
              </div>
            </a>
            <a href={`/calculators/affordability?state=${data.state}&postcode=${data.postcode}`} className="calculator-cta-card">
              <span className="cta-icon">💰</span>
              <div>
                <strong>Affordability Calculator</strong>
                <p>How much can you borrow? What will it cost per month?</p>
              </div>
            </a>
            <a href={`/calculators/roi?state=${data.state}&postcode=${data.postcode}`} className="calculator-cta-card">
              <span className="cta-icon">📈</span>
              <div>
                <strong>Investment Calculator</strong>
                <p>Net yield, cash-on-cash return, weekly cashflow.</p>
              </div>
            </a>
            <a href={`/fhbg?state=${data.state}&postcode=${data.postcode}`} className="calculator-cta-card">
              <span className="cta-icon">🏡</span>
              <div>
                <strong>First Home Guarantee</strong>
                <p>Check if you're eligible for the 5% deposit scheme.</p>
              </div>
            </a>
          </div>
        </section>

        <section id="education" className="education-section">
          <h2 className="section-title">Education</h2>
          <p className="data-vintage-notice">📊 School data: ACARA 2025 — updated annually, usually November.</p>
          <div className="education-grid">
            <div className="stat-card">
              <h3>Schools</h3>
              <div className="stat-value">{data.education.school_count}</div>
              <p className="stat-change">Including {data.education.schools.filter(s => s.type === 'Primary').length} primary, {data.education.schools.filter(s => s.type === 'Secondary').length} secondary</p>
            </div>
            <div className="stat-card">
              <h3>Avg ICSEA</h3>
              <div className="stat-value">{Math.round(data.education.avg_icsea)}</div>
              <p className="stat-change">{data.education.school_quality} quality score</p>
            </div>
          </div>
          {data.education.schools.length > 0 && (
            <div className="scroll-container-y">
              {[...data.education.schools].sort((a,b) => (b.icsea || 0) - (a.icsea || 0)).map((school, idx) => (
                <div key={idx} className="school-card" style={{ marginBottom: '10px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{school.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{school.type} · {school.sector}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: getSchoolGrade(school.icsea).color }}>
                      {getSchoolGrade(school.icsea).grade}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grade</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.education.schools.length === 0 && (
            <div className="data-pending-card">
              <h3>📊 School Data Pending</h3>
              <p>School data for {data.name} is being processed. Check back soon.</p>
            </div>
          )}
        </section>



        {data.amenities.per_category?.religion && data.amenities.per_category.religion.length > 0 && (
          <section className="religion-section">
            <h2 className="section-title">Places of Worship</h2>
            <p className="section-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Churches, mosques, temples, and synagogues within 2.5km. Click on the map to see locations.
            </p>
            <div className="horizontal-scroll-container">
              {[...data.amenities.per_category.religion]
                .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
                .slice(0, 12)
                .map((place, idx) => (
                  <div key={idx} className="catchment-card" style={{ minWidth: '280px' }}>
                    <span className="catchment-icon">
                      {place.religion === 'muslim' ? '🕌' : place.religion === 'hindu' ? '🛕' : place.religion === 'jewish' ? '🕍' : place.religion === 'buddhist' ? '☸️' : '⛪'}
                    </span>
                    <div className="catchment-info">
                      <strong>{place.name}</strong>
                      <span className="source-tag tag-primary" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                        {place.religion || 'Multi-faith'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{place.distance_km}km away</div>
                    </div>
                  </div>
                ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Source: OpenStreetMap contributors · {data.amenities.per_category.religion.length} places found within 2.5km
            </p>
          </section>
        )}

        <section id="amenities" className="hospital-section">
          <h2 className="section-title">Nearest Hospital</h2>
          {data.amenities.nearest_hospital && data.amenities.nearest_hospital.length > 0 ? (
            <div className="horizontal-scroll-container">
              {data.amenities.nearest_hospital.slice(0, 3).map((hospital, idx) => (
                <div key={idx} className="hospital-card" style={{ minWidth: '280px' }}>
                  <span className="hospital-icon">🏥</span>
                  <div className="hospital-info">
                    <strong>{hospital.name}</strong>
                    <p>{hospital.distance_km}km away</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No hospital data available for this suburb yet.</p>
          )}
        </section>

        <section className="amenities-section">
          <h2 className="section-title">Amenities</h2>
          <div className="horizontal-scroll-container">
            <div className="stat-card" style={{ minWidth: '240px' }}>
              <h3>Supermarkets</h3>
              <div className="stat-value">{data.amenities.total_counts.supermarket}</div>
              {Object.entries(data.amenities.supermarket_brands).length > 0 && (
                <p className="stat-change">{Object.entries(data.amenities.supermarket_brands).map(([brand, count]) => `${brand}: ${count}`).join(' · ')}</p>
              )}
            </div>
            <div className="stat-card" style={{ minWidth: '240px' }}>
              <h3>Healthcare</h3>
              <div className="stat-value">{data.amenities.total_counts.health}</div>
              {data.amenities.nearest_hospital.length > 0 && (
                <p className="stat-change">{data.amenities.nearest_hospital[0].name} ({data.amenities.nearest_hospital[0].distance_km}km away)</p>
              )}
            </div>
            <div className="stat-card" style={{ minWidth: '240px' }}>
              <h3>Transport</h3>
              <div className="stat-value">{data.amenities.total_counts.transit}</div>
              {data.amenities.total_counts.train_station > 0 && (
                <p className="stat-change">{data.amenities.total_counts.train_station} train stations</p>
              )}
            </div>
            <div className="stat-card" style={{ minWidth: '240px' }}>
              <h3>Parks</h3>
              <div className="stat-value">{data.environment.parks_count}</div>
              <p className="stat-change">{data.environment.parks_coverage_pct}% coverage</p>
            </div>
            {data.amenities?.nearest_supermarket?.length > 0 && (
              <div className="stat-card" style={{ minWidth: '240px' }}>
                <h3>Nearest Supermarket</h3>
                <div className="stat-value">{data.amenities.nearest_supermarket[0].name}</div>
                <p className="stat-change">{data.amenities.nearest_supermarket[0].distance_km} km away</p>
              </div>
            )}
            {data.amenities?.total_counts?.cafe > 0 && (
              <div className="stat-card" style={{ minWidth: '240px' }}>
                <h3>Cafés</h3>
                <div className="stat-value">{data.amenities.total_counts.cafe}</div>
                <p className="stat-change">within walking distance</p>
              </div>
            )}
          </div>
        </section>

        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqData.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <h3 className="faq-question">{faq.q}</h3>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="due-diligence-section">
          <h2 className="section-title">Due Diligence Links</h2>
          <p className="section-subtitle">Official government resources to verify before purchasing.</p>
          <div className="due-diligence-grid">
            {data.state === 'VIC' && (
              <>
                <a href="https://www.findmyschool.vic.gov.au" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🏫</span>
                  <div>
                    <strong>Find My School Zone</strong>
                    <p>Official VIC school catchment checker</p>
                  </div>
                </a>
                <a href="https://mapshare.vic.gov.au/vicplan/" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🗺️</span>
                  <div>
                    <strong>VIC Planning Portal</strong>
                    <p>Zoning, overlays, planning permits</p>
                  </div>
                </a>
                <a href="https://www.environment.vic.gov.au/flood-mapping" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🌊</span>
                  <div>
                    <strong>Flood Mapping (DELWP)</strong>
                    <p>Check flood risk for the property</p>
                  </div>
                </a>
              </>
            )}
            {data.state === 'NSW' && (
              <>
                <a href="https://enrollnow.det.nsw.edu.au" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🏫</span>
                  <div>
                    <strong>NSW School Enrolment</strong>
                    <p>Check catchment zones</p>
                  </div>
                </a>
                <a href="https://www.planningportal.nsw.gov.au" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🗺️</span>
                  <div>
                    <strong>NSW Planning Portal</strong>
                    <p>Zoning and development applications</p>
                  </div>
                </a>
              </>
            )}
            {data.state === 'QLD' && (
              <>
                <a href="https://www.qed.qld.gov.au/schools/school-enrolment" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🏫</span>
                  <div>
                    <strong>QLD School Enrolment</strong>
                    <p>Check catchment zones</p>
                  </div>
                </a>
                <a href="https://www.qld.gov.au/housing/buying-owning-home/financial-concessions" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🏡</span>
                  <div>
                    <strong>QLD Concessions</strong>
                    <p>First home owner grant and concessions</p>
                  </div>
                </a>
              </>
            )}
            {data.state === 'WA' && (
              <>
                <a href="https://www.wa.gov.au/organisation/department-of-education/school-enrolment" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🏫</span>
                  <div>
                    <strong>WA School Enrolment</strong>
                    <p>Check catchment zones</p>
                  </div>
                </a>
                <a href="https://www.landgate.wa.gov.au/bmvf/app/services/locate-a-property" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                  <span className="dd-icon">🗺️</span>
                  <div>
                    <strong>Landgate</strong>
                    <p>Property and land information</p>
                  </div>
                </a>
              </>
            )}
            {data.state === 'SA' && (
              <a href="https://www.education.sa.gov.au/parenting-and-childcare/school-enrolment" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
                <span className="dd-icon">🏫</span>
                <div>
                  <strong>SA School Enrolment</strong>
                  <p>Check catchment zones</p>
                </div>
              </a>
            )}
            <a href="https://www.airservicesaustralia.com/aircraft-noise/" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
              <span className="dd-icon">✈️</span>
              <div>
                <strong>Aircraft Noise</strong>
                <p>Check flight path noise contours</p>
              </div>
            </a>
            <a href="https://www.nbnco.com.au/connect-home-or-business/check-your-address" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
              <span className="dd-icon">📶</span>
              <div>
                <strong>NBN Availability</strong>
                <p>Check NBN technology at address</p>
              </div>
            </a>
            <a href="https://www.abs.gov.au/statistics/people/population/population-census" target="_blank" rel="noopener noreferrer" className="due-diligence-link">
              <span className="dd-icon">📊</span>
              <div>
                <strong>ABS Census Data</strong>
                <p>Official census information</p>
              </div>
            </a>
          </div>
        </section>

        <section className="compare-cta-section">
          <div className="compare-cta-card">
            <h3>Compare {data.name} with another suburb</h3>
            <p>See how {data.name} stacks up against any other Australian suburb on schools, transit, income and more.</p>
            <Link to={`/suburb/compare?s1=${data.slug}`} className="btn btn-primary">
              Compare Suburbs →
            </Link>
          </div>
        </section>

        <section className="disclaimer-section">
          <div className="disclaimer-card">
            <h3>General Information Notice</h3>
            <p>SuburbSense provides general information only. Nothing on this site constitutes financial, property investment, legal, or tax advice. Always verify data with the relevant government authority before making any purchasing decision.</p>
            <p>All information is derived from publicly available government data sources (ABS Census 2021, ACARA 2025, AER CDR API, OpenStreetMap, State Revenue Offices). Data currency varies by source — see individual attributions for details.</p>
            <p>This platform may earn a referral fee if you switch energy or internet plans through our partner links. This does not affect the suburb data or scores we display. Read our <a href="/disclosure">affiliate disclosure</a> for details.</p>
            <p className="disclaimer-meta">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>SuburbSense</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Free suburb intelligence for first home buyers. School grades, transit scores, census data and grant eligibility.
              </p>
            </div>
            <div className="footer-col">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/">Suburb Search</Link></li>
                <li><Link to="/calculators/stamp-duty">Stamp Duty Calculator</Link></li>
                <li><Link to="/calculators/affordability">Affordability Calculator</Link></li>
                <li><Link to="/calculators/roi">Investment Calculator</Link></li>
                <li><Link to="/energy/compare">Compare Energy</Link></li>
                <li><Link to="/nbn">NBN Check</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Tools</h4>
               <ul>
                 <li><Link to="/fhbg">First Home Guarantee</Link></li>
                 <li><Link to="/land-tax">Land Tax Calculator</Link></li>
                 <li><Link to="/council-rates">Council Rates</Link></li>
               </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/attribution">Data Sources</Link></li>
                <li><Link to="/disclosure">Affiliate Disclosure</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 SuburbSense · suburbsense.com.au</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              General information only. Not financial advice. 
              <Link to="/attribution">Data sources</Link> · ABS Census 2021 · ACARA 2025 · CC BY 4.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
