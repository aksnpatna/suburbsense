# UI Premortem Analysis & Uplift Plan

## Current State Overview
The app has a solid foundation with:
- Clean, modern design system with Inter/Sora fonts and blue primary color
- Responsive layout with hero, calculators grid, and suburb profiles
- Local storage-based suburb library (saved/recent) and email alerts
- TOC navigation on suburb profiles
- Search functionality with debounced API calls

## UI Premortem: What Could Go Wrong?
1. **Hero section is too generic** - Fails to immediately communicate unique value proposition
2. **Calculator cards lack visual hierarchy** - Hard to distinguish between popular/essential tools
3. **Suburb profile feels crowded** - TOC helps but sections still feel dense
4. **No visual feedback for calculator inputs** - Users don't know if calculations are happening
5. **Mobile navigation could be smoother** - Hamburger menu feels basic
6. **Data visualization is minimal** - Income/age distribution as simple bar charts
7. **CTA clarity** - Some buttons don't clearly state what happens next

## Uplift Plan

### 1. Hero Section Optimization
Make the hero more compelling and user-centric.

```jsx
// frontend/src/App.jsx - update hero section
<section className="hero">
  <div className="hero-content">
    <div className="hero-badge">🏆 Free Australian Suburb Intelligence</div>
    <h1 className="hero-title">
      Know <span style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>the true cost</span> of living in any suburb
    </h1>
    <p className="hero-subtitle">
      ABS census, ACARA schools, transit scores, and bill comparisons — <strong>all free, no login</strong>
    </p>
    
    <div className="hero-metrics">
      <div className="hero-metric">
        <span className="metric-number">11,599</span>
        <span className="metric-label">Suburbs</span>
      </div>
      <div className="hero-metric">
        <span className="metric-number">30+</span>
        <span className="metric-label">Energy Retailers</span>
      </div>
      <div className="hero-metric">
        <span className="metric-number">100%</span>
        <span className="metric-label">Browser-Based</span>
      </div>
    </div>
    
    <div className="search-box">
      <SuburbSearch onSelect={handleSuburbSelect} placeholder="Search a suburb to see key stats..." />
    </div>
    
    {selectedSuburb && (
      <div className="selected-suburb">
        <h3>Selected: {selectedSuburb.name}, {selectedSuburb.state} {selectedSuburb.postcode}</h3>
        <p>Click <a href={`/suburb/${selectedSuburb.slug}`} className="btn btn-primary">View Detailed Profile</a> to explore calculators and data</p>
      </div>
    )}
  </div>
</section>
```

### 2. Calculator Cards Visual Hierarchy
Add visual distinction for popular/essential calculators.

```css
/* frontend/src/index.css - update calculator card styles */
.calculator-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.calculator-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.calculator-card:hover::before {
  transform: scaleX(1);
}

.calculator-card.featured {
  border: 2px solid var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(59, 130, 246, 0.03));
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.calculator-card.featured::before {
  transform: scaleX(1);
}

.calculator-card .calculator-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.calculator-card:hover .calculator-icon {
  transform: translateY(-4px);
}

.calculator-card .calculator-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.calculator-card .calculator-info p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.hub-card-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.hub-card-tag.Popular {
  background: #fef3c7;
  color: #92400e;
}

.hub-card-tag.Essential {
  background: #dbeafe;
  color: #1e40af;
}

.hub-card-tag.Detailed {
  background: #d1fae5;
  color: #065f46;
}

.hub-card-tag.2026 {
  background: #f3e8ff;
  color: #7c3aed;
}
```

### 3. Suburb Profile Layout Improvements
Make the profile more scannable and visually appealing.

```jsx
// frontend/src/App.jsx - update hero-dashboard
<div className="hero-dashboard">
  <div className="hero-breadcrumb">
    <Link to="/">Home</Link>
    <span>/</span>
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
      
      <div className="hero-badges">
        {data.demographics?.population_2021 && (
          <div className="hero-badge">
            <span className="hero-badge-icon">📍</span>
            <span className="hero-badge-text">{data.demographics.population_2021.toLocaleString()} Pop</span>
          </div>
        )}
        {data.transport?.cbd_distance_mins && (
          <div className="hero-badge">
            <span className="hero-badge-icon">🚗</span>
            <span className="hero-badge-text">{data.transport.cbd_distance_mins} min to CBD</span>
          </div>
        )}
        {data.demographics?.median_age && (
          <div className="hero-badge">
            <span className="hero-badge-icon">👥</span>
            <span className="hero-badge-text">Avg Age {data.demographics.median_age}</span>
          </div>
        )}
        {data.demographics?.owner_occupier_rate && (
          <div className="hero-badge">
            <span className="hero-badge-icon">🏠</span>
            <span className="hero-badge-text">{data.demographics.owner_occupier_rate}% Own</span>
          </div>
        )}
      </div>
    </div>
    
    <div className="hero-score-widget">
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

<div className="suburb-actions">
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
```

### 4. Mobile Navigation Enhancement
Create a smoother mobile navigation experience.

```css
/* frontend/src/index.css - update mobile navigation */
.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  flex-direction: column;
  gap: 5px;
  z-index: 1002;
  transition: all 0.2s ease;
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.active .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger.active .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    gap: 0;
    max-height: 70vh;
    overflow-y: auto;
    transition: all 0.3s ease;
    transform: translateY(-10px);
    opacity: 0;
    pointer-events: none;
  }
  
  .nav-links.mobile-open {
    display: flex;
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  
  .nav-link {
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    text-align: left;
    justify-content: flex-start;
  }
  
  .nav-dropdown-menu {
    position: static;
    box-shadow: none;
    border-left: 2px solid var(--border-color);
    margin-left: 1.5rem;
  }
}
```

### 5. Data Visualization Improvements
Enhance income and age distribution charts.

```css
/* frontend/src/index.css - update income chart */
.income-chart {
  margin-top: 1rem;
}

.income-bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.income-bar-row.compact {
  gap: 0.5rem;
}

.income-label {
  flex: 0 0 130px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.income-bar-container {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.income-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color));
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.income-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.income-pct {
  flex: 0 0 40px;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}
```

### 6. Calculator Loading States
Add visual feedback for calculations.

```jsx
// frontend/src/pages/AffordabilityCalculator.jsx - example loading state
{loading && (
  <div className="calculator-loading">
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
    <p>Calculating your borrowing power...</p>
  </div>
)}
```

```css
/* frontend/src/index.css - calculator loading state */
.calculator-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-top: 1rem;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.calculator-loading p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}
```

### 7. Accessibility Improvements
Ensure the app is accessible to all users.

```jsx
// frontend/src/components/SuburbSearch.jsx - improve accessibility
<input
  type="text"
  value={query}
  onChange={handleInputChange}
  placeholder={placeholder}
  className="suburb-search-input"
  aria-label="Search suburbs"
  aria-describedby="search-hint"
  role="searchbox"
  autoComplete="off"
/>

{/* Add ARIA labels to results */}
<div className="search-results" role="listbox" aria-label="Search results">
  {results.map((suburb, index) => (
    <div
      key={suburb.id}
      className="search-result-item"
      onClick={() => handleSelect(suburb)}
      role="option"
      aria-label={`${suburb.name}, ${suburb.state} ${suburb.postcode}`}
      aria-selected={false}
    >
      {/* Result content */}
    </div>
  ))}
</div>
```

### 8. Performance Optimizations
Ensure fast loading and smooth interactions.

```jsx
// frontend/src/components/AmenityMap.jsx - improve map performance
import { useEffect, useRef, useMemo } from 'react';

// Memoize markers to prevent unnecessary re-renders
const markers = useMemo(() => {
  const categoryMarkers = {};
  categories.forEach((category) => {
    categoryMarkers[category.key] = amenities[category.key]?.map((amenity) => ({
      ...amenity,
      icon: category.icon,
      color: category.color
    }));
  });
  return categoryMarkers;
}, [amenities]);

// Lazy load map when component is visible
const mapRef = useRef(null);
const observer = useRef(null);

useEffect(() => {
  observer.current = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !mapInstanceRef.current) {
        initializeMap();
        observer.current.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  if (mapRef.current) {
    observer.current.observe(mapRef.current);
  }
  
  return () => {
    if (observer.current && mapRef.current) {
      observer.current.unobserve(mapRef.current);
    }
  };
}, []);
```

### Implementation Priority
1. **Immediate (1-2 days)**: Hero section, calculator card styles, loading states
2. **Short-term (3-5 days)**: Suburb profile layout, mobile navigation, accessibility
3. **Medium-term (1-2 weeks)**: Data visualization enhancements, performance optimizations
4. **Long-term (2-4 weeks)**: Advanced animations, dark mode, micro-interactions

### Success Metrics
- Increase in search usage (track via Google Analytics or similar)
- Higher conversion rate from home page to calculator pages
- Improved time on page for suburb profiles
- Reduced bounce rate on mobile devices
- Positive user feedback on navigation and visual design

## Risks & Mitigation
- **Over-engineering**: Keep changes focused on user needs, avoid unnecessary complexity
- **Performance impact**: Test all changes on low-end devices, monitor Core Web Vitals
- **Design consistency**: Maintain existing design system, use variables where possible
- **Mobile responsiveness**: Test every change on multiple mobile devices
