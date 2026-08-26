import React from 'react';
import { Helmet } from 'react-helmet-async';

const PROFESSIONAL_CATEGORIES = [
  {
    id: 'mortgage-brokers',
    icon: '🏦',
    title: 'Mortgage Brokers',
    desc: 'Independent brokers who compare dozens of lenders to find the right home loan for your situation.',
    tags: ['First Home Buyers', 'Refinancing', 'Investment Loans'],
    color: '#3b82f6',
  },
  {
    id: 'conveyancers',
    icon: '📝',
    title: 'Conveyancers & Solicitors',
    desc: 'Handle the legal transfer of property, review contracts and manage settlement on your behalf.',
    tags: ['Property Purchase', 'Settlement', 'Contract Review'],
    color: '#8b5cf6',
  },
  {
    id: 'financiers',
    icon: '💼',
    title: 'Financial Advisers',
    desc: 'Help you structure your finances, plan for property investment, and understand tax implications.',
    tags: ['Investment Planning', 'Tax Strategy', 'SMSF Property'],
    color: '#10b981',
  },
  {
    id: 'property-managers',
    icon: '🔑',
    title: 'Property Managers',
    desc: 'Manage your investment property — tenant screening, rent collection, maintenance coordination.',
    tags: ['Investors', 'Rental Management', 'Landlords'],
    color: '#f59e0b',
  },
  {
    id: 'buyers-agents',
    icon: '🎯',
    title: "Buyer's Agents",
    desc: 'Represent your interests in property searches, negotiations, and auctions across Australia.',
    tags: ['Property Search', 'Auction Bidding', 'Negotiation'],
    color: '#ef4444',
  },
  {
    id: 'inspectors',
    icon: '🔍',
    title: 'Building Inspectors',
    desc: 'Pre-purchase building and pest inspections so you know exactly what you are buying.',
    tags: ['Building Reports', 'Pest Reports', 'Pre-Purchase'],
    color: '#06b6d4',
  },
];

function ProfessionalCard({ pro }) {
  return (
    <div
      style={{
        background: 'var(--surface-color)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: pro.color, borderRadius: '16px 16px 0 0' }} />
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{pro.icon}</div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>{pro.title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{pro.desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {pro.tags.map(t => (
          <span key={t} style={{
            background: 'var(--surface-alt)',
            color: 'var(--text-secondary)',
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            border: '1px solid var(--border-color)',
          }}>{t}</span>
        ))}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        background: 'var(--surface-alt)',
        border: `1px solid ${pro.color}40`,
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
        Coming Soon — Curating providers
      </div>
    </div>
  );
}

export function PartnersPage() {
  return (
    <div className="partners-page fade-in">
      <Helmet>
        <title>Find Professionals for Your Move | SuburbSense</title>
        <meta name="description" content="Find trusted mortgage brokers, conveyancers, financial advisers and property professionals to help with your next move. Curated by SuburbSense." />
        <link rel="canonical" href="https://suburbsense.com.au/partners" />
      </Helmet>

      {/* Hero */}
      <section className="hero" style={{ padding: '5rem 1rem 4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="hero-badge" style={{ marginBottom: '1rem' }}>🤝 Trusted Professionals</div>
          <h1 className="hero-title" style={{ maxWidth: '700px', margin: '0 auto', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Find the right professional{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              for your move
            </span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '600px', margin: '1rem auto 0', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Whether you are buying your first home, refinancing, or investing — we are building a trusted directory of Australian professionals to support you at every step.
          </p>
        </div>
      </section>

      {/* Professional Categories Grid */}
      <section style={{ padding: '3rem 0 5rem', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Professional Categories</p>
            <h2 style={{ marginBottom: '0.5rem' }}>Who can help you?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
              We are curating a network of independent, reputable professionals across Australia. Get in touch to be listed.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {PROFESSIONAL_CATEGORIES.map(pro => (
              <ProfessionalCard key={pro.id} pro={pro} />
            ))}
          </div>

          {/* Notify Me CTA */}
          <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2.5rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Want to be notified when professionals are listed?</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              We will email you when we launch our verified professional directory in your state.
            </p>
            <a href="mailto:hello@suburbsense.com.au?subject=Notify me when professionals are listed" className="btn btn-primary" style={{ borderRadius: '30px', padding: '0.85rem 2rem' }}>
              Notify Me →
            </a>
          </div>
        </div>
      </section>

      {/* For Businesses divider */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem 0', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>For Professionals &amp; Businesses</p>
      </div>

      {/* Audience + Stats + Business CTA */}
      <section style={{ padding: '3rem 0 4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Reach Australians when they are deciding where to live.</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.5rem auto 0' }}>
              Every visitor to SuburbSense has expressed intent — they searched for a suburb, compared two areas, or looked up FHOG eligibility. This is not passive browsing.
            </p>
          </div>

          {/* Audience cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { icon: '🏠', title: 'First home buyers', desc: 'Researching grants, stamp duty and loan eligibility.' },
              { icon: '📦', title: 'Relocating families', desc: 'Comparing schools, transit scores and suburb safety.' },
              { icon: '📶', title: 'New movers', desc: 'Comparing NBN providers, energy plans and local services.' },
              { icon: '💰', title: 'Property investors', desc: 'Tracking price growth, yield indicators and trajectories.' },
            ].map(a => (
              <div key={a.title} style={{ padding: '1.5rem', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.icon}</div>
                <h4 style={{ marginBottom: '0.3rem' }}>{a.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '3rem' }}>
            {[
              { n: '4.1k', l: 'Monthly sessions' },
              { n: '4.2k', l: 'Indexed pages' },
              { n: '8', l: 'States & territories' },
              { n: '4.8k', l: 'Suburb profiles' },
            ].map(s => (
              <div key={s.l} style={{ padding: '1.25rem', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>{s.n}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Business CTA */}
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Ready to reach first home buyers?</h2>
            <p style={{ color: '#cbd5e1', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Send us your company name, the audience you want to reach, and what type of placement interests you. We will respond within 1 business day.
            </p>
            <a
              href="mailto:partners@suburbsense.com.au"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: '#3b82f6', color: '#fff',
                padding: '1rem 2.5rem', borderRadius: '30px',
                fontSize: '1.1rem', fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
              }}
            >
              📧 partners@suburbsense.com.au
            </a>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>No forms. No gatekeeping. Just email us directly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
