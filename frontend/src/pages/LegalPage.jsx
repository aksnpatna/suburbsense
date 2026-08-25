import React from 'react';

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      <h3>Our Approach to Privacy</h3>
      <p><strong>The short version:</strong> SuburbSense is designed to be fully functional without requiring your personal data. You are free to explore suburb insights, run calculators, and compare infrastructure without ever creating an account or handing over personally identifiable information.</p>
      
      <p>This Privacy Policy outlines how SuburbSense ("we", "us", "our") manages information collected through suburbsense.com (the "Service"). We take your privacy seriously and comply with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).</p>

      <h3>1. Information Collection</h3>
      <p><strong>Data you choose to share:</strong> The only time we collect personal information (like your email address) is if you actively opt-in to a waitlist or newsletter. Account creation is not required to use our core features.</p>
      
      <p><strong>System and usage data:</strong> Like all websites, our infrastructure providers automatically log certain technical details to keep the site secure and functional:</p>
      <ul>
        <li><strong>IP Addresses:</strong> Used strictly for rate-limiting and security, not for individual tracking.</li>
        <li><strong>Aggregated Analytics:</strong> We look at total page views to see which features are popular, but we never track individual user journeys.</li>
        <li><strong>Device Data:</strong> Basic browser and device types to ensure the site displays correctly.</li>
      </ul>

      <h3>2. Tracking & Cookies</h3>
      <p>We use minimal cookies. If you consent to our cookie banner, a preference cookie is saved (containing no personal data). We may also use standard analytics cookies strictly for aggregated traffic measurement, never for invasive advertising profiling.</p>

      <h3>3. Data Usage & Storage</h3>
      <p>Any data we do collect is used exclusively to maintain and improve SuburbSense, or to send you communications you specifically requested. We will never sell your data, use it to build advertising profiles, or share it with unsolicited third-party marketers. All infrastructure is hosted securely, and our primary databases contain only public government property data—no user data.</p>

      <h3>4. Local-Only Calculators</h3>
      <p>Our financial calculators (Stamp Duty, Borrowing Power, etc.) process your inputs entirely within your browser. The numbers you type are never transmitted to our servers or saved in any database. Once you refresh or close the tab, that data is gone forever.</p>

      <h3>5. Third-Party Integrations (CIMET)</h3>
      <p><strong>Utility Comparison:</strong> We provide a free utility comparison tool powered by CIMET Sales Pty Ltd (ABN 72 620 395 726). If you decide to compare or switch plans, you will be interacting directly with CIMET's system.</p>
      
      <p>Any details you enter into the comparison tool (name, address, usage) are collected by CIMET and are subject to their Privacy Policy. SuburbSense does not have access to, nor do we store, any of the personal information you submit to CIMET.</p>

      <h3>6. Your Rights & Contact</h3>
      <p>You have the right to request access to or correction of any personal data we hold about you. If you have any concerns or wish to make a privacy complaint, please contact us at <a href="mailto:privacy@suburbsense.com">privacy@suburbsense.com</a>. We will respond within 30 days.</p>
      
      <p><em>Last updated: August 2026</em></p>
    `
  },
  terms: {
    title: 'Terms of Service',
    content: `
      <h3>1. Information Only (No Financial Advice)</h3>
      <p>SuburbSense is an informational platform. The data, scores, and calculator outputs provided do not constitute financial, legal, tax, or real estate advice. We are not licensed financial advisers or credit brokers. You should always consult with a certified professional before making any property or financial decisions.</p>

      <h3>2. Data Accuracy & Government Sources</h3>
      <p>We aggregate our data from reputable public sources (e.g., ABS, State Revenue Offices, Transport Authorities). While we make every effort to keep this data current and accurate, we cannot guarantee its absolute correctness. Government policies and rates can change, and you should verify all figures independently.</p>

      <h3>3. Calculator Estimates</h3>
      <p>The calculators provided on SuburbSense (including Stamp Duty, Affordability, and ROI) are intended as rough guides based on standard assumptions and published rates. Your actual costs, borrowing capacity, and tax obligations will vary based on lender policies, personal circumstances, and official assessments.</p>

      <h3>4. External Links & Third Parties</h3>
      <p>Our site contains links to third-party services, such as energy comparison via CIMET and broadband data via nbn™. These services operate under their own terms and privacy policies. SuburbSense accepts no liability for any agreements or interactions you have with these third-party providers.</p>

      <h3>5. Limitation of Liability</h3>
      <p>By using SuburbSense, you acknowledge that the service is provided "as is". We hold no liability for any financial loss, damages, or missed opportunities resulting from reliance on the information or tools provided on this website.</p>

      <p><strong>Enquiries:</strong> <a href="mailto:hello@suburbsense.com">hello@suburbsense.com</a></p>
    `
  },
  disclosure: {
    title: 'Affiliate Disclosure',
    content: `
      <h3>How We Keep SuburbSense Free</h3>
      <p>SuburbSense is free to use. To help cover our server and development costs, we participate in select affiliate marketing programs. If you click on certain links (like our utility comparison tools) and make a purchase or switch providers, we may earn a referral commission at absolutely no extra cost to you.</p>

      <h3>Our Commitment to Impartiality</h3>
      <p>Our core product is accurate property data. We guarantee that our suburb scores, data representations, and calculator results are never manipulated or influenced by our affiliate partnerships. We keep our data completely objective.</p>

      <h3>Our Partners</h3>
      <ul>
        <li><strong>CIMET Sales Pty Ltd:</strong> We partner with CIMET to provide energy and internet comparison services. When you switch a utility through the comparison widget, SuburbSense receives a commission.</li>
      </ul>

      <h3>Data Independence</h3>
      <p>When you use partner services like the CIMET comparison tool, you are providing your information directly to them under their terms and privacy policies. We do not have access to the data you provide to them.</p>
    `
  },
  attribution: {
    title: 'Data Sources',
    content: `
      <h3>Overview</h3>
      <p>Every data point on SuburbSense comes from Australian government sources. We don't estimate, guess, or use real estate industry data.</p>

      <h3>Data sources</h3>
      <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
        <tr style="background:#f8fafc;">
          <th style="text-align:left; padding:0.5rem; border:1px solid #e2e8f0;">Source</th>
          <th style="text-align:left; padding:0.5rem; border:1px solid #e2e8f0;">Data</th>
          <th style="text-align:left; padding:0.5rem; border:1px solid #e2e8f0;">License</th>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">ABS Census 2021</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Population, income, age, household</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">ACARA MySchool 2025</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">School ICSEA, enrolments, percentiles</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">PTV GTFS</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">VIC transit stops/routes</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">TfNSW GTFS</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">NSW transit stops/routes</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">TransLink GTFS</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">QLD transit stops/routes</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Adelaide Metro GTFS</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">SA transit stops/routes</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Transperth GTFS</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">WA transit stops/routes</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">CC BY 4.0</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">OpenStreetMap</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Amenities, POIs, boundaries</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">ODbL</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">AER CDR API</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Energy plan data</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Open data</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">State Revenue Offices</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Stamp duty, FHOG rates</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Public information</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Housing Australia</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">FHBG price caps</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Public information</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">ATO</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Income tax rates</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Public information</td>
        </tr>
        <tr>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">nbn™</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Connection technology data</td>
          <td style="padding:0.5rem; border:1px solid #e2e8f0;">Public API</td>
        </tr>
      </table>

      <h3>Data currency</h3>
      <ul>
        <li>School data: ACARA 2025 (updated annually)</li>
        <li>Census data: ABS 2021 (next census 2026, data from 2027)</li>
        <li>Transit data: GTFS feeds (updated quarterly)</li>
        <li>Grant/Stamp Duty rates: State Revenue Offices (updated as published)</li>
        <li>Energy plans: AER CDR API (real-time)</li>
      </ul>

      <h3>Attribution</h3>
      <p>All government data is licensed under Creative Commons Attribution 4..0 (CC BY 4.0) unless otherwise stated. You are free to share and adapt this data with attribution to the original source.</p>
    `
  }
};

export function LegalPage({ type = 'privacy' }) {
  const content = legalContent[type];

  if (!content) {
    return (
      <div className="container">
        <div className="legal-page">
          <h1>Page Not Found</h1>
          <p>The requested page does not exist.</p>
          <a href="/" className="btn btn-primary">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="legal-page">
        <div className="page-header">
          <h1>{content.title}</h1>
        </div>

        <div className="content-wrapper">
          <div 
            className="legal-content" 
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
          
          <div className="revision-info">
            <p>Last revised: August 2026</p>
            <p className="disclaimer">
              This page is for informational purposes only and does not constitute legal advice.
            </p>
          </div>

          <div className="page-actions">
            <a href="/" className="btn btn-primary">Back to Home</a>
            {type !== 'privacy' && <a href="/privacy" className="btn btn-secondary">Privacy Policy</a>}
            {type !== 'terms' && <a href="/terms" className="btn btn-secondary">Terms of Service</a>}
            {type !== 'disclosure' && <a href="/disclosure" className="btn btn-secondary">Affiliate Disclosure</a>}
            {type !== 'attribution' && <a href="/attribution" className="btn btn-secondary">Data Sources</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
