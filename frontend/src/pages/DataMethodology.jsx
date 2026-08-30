import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function DataMethodology() {
  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Helmet>
        <title>Data Methodology | SuburbSense</title>
        <meta name="description" content="Learn how SuburbSense calculates livability scores, sources ABS census data, and integrates school information." />
      </Helmet>

      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Our Data Methodology</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem' }}>
        At SuburbSense, we believe property decisions should be driven by hard evidence, not guesswork. 
        Here is exactly how we source our data and calculate our scores.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>The Livability Score</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Our overall Livability Score (out of 100) is a weighted composite of several underlying metrics:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li><strong>Education (30%):</strong> Based on the proximity to schools and average ICSEA (Index of Community Socio-Educational Advantage) scores from ACARA.</li>
          <li><strong>Transit (25%):</strong> Evaluates the density of public transport stops (trains, buses, trams) within the suburb boundaries and distance to the CBD.</li>
          <li><strong>Amenities (25%):</strong> Measures the number of essential lifestyle amenities, including parks, hospitals, supermarkets, and cafes (sourced via OpenStreetMap).</li>
          <li><strong>Demographics (20%):</strong> Factors in owner-occupier rates and family density to assess community stability (sourced via ABS Census 2021).</li>
        </ul>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Data Sources</h2>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Australian Bureau of Statistics (ABS)</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We utilize the 2021 Census data to provide accurate population counts, median ages, and housing tenure statistics.
            </p>
          </div>
          <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>ACARA (MySchool)</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              School locations, types, and ICSEA scores are sourced from the Australian Curriculum, Assessment and Reporting Authority.
            </p>
          </div>
          <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>OpenStreetMap & Mapbox</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Geospatial data, including suburb boundaries and local amenities, are powered by OSM contributors and Mapbox.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Calculators & Estimates</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Our financial tools (ROI Calculator, Stamp Duty Calculator) are designed to provide indicative estimates based on current state revenue office rates and standard mortgage assumptions. They do not constitute financial advice. Always consult with a licensed professional before making financial decisions.
        </p>
      </section>
    </div>
  );
}
