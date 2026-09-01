/**
 * SuburbSense Affiliate Configuration
 * 
 * Replace the `url` fields below with your actual tracking links from Commission Factory,
 * Impact, or direct partners. You can easily toggle campaigns on and off here.
 */

export const AFFILIATE_CONFIG = {
  // Broadband & NBN Partners
  broadband: {
    enabled: true,
    topPicks: [
      {
        id: 'aussie_broadband',
        name: 'Aussie Broadband',
        description: 'Fast, reliable NBN with award-winning Aussie support.',
        tag: 'Most Popular',
        url: 'https://www.aussiebroadband.com.au/',
        icon: '🌐'
      },
      {
        id: 'superloop',
        name: 'Superloop',
        description: 'High-speed performance for gamers and heavy streamers.',
        tag: 'Best Value',
        url: 'https://www.superloop.com/',
        icon: '⚡'
      }
    ]
  },
  
  // Energy Partners
  energy: {
    enabled: true,
    topPicks: [
      {
        id: 'origin_energy',
        name: 'Origin Energy',
        description: 'Predictable rates and great solar feed-in tariffs.',
        tag: 'Green Pick',
        url: 'https://www.originenergy.com.au/',
        icon: '💡'
      }
    ]
  },

  // Mortgage Brokers / Lead Gen
  mortgage: {
    enabled: true,
    partnerName: 'AJ Finance Services',
    ctaText: 'Speak to a Broker for Free',
    description: 'Find out exactly what you can borrow in this suburb and compare loans from 35+ lenders.',
    url: 'https://www.ajfinanceservices.com.au/',
  },

  // Moving & Removalists
  moving: {
    enabled: true,
    partnerName: 'Muval',
    ctaText: 'Compare Removalists',
    description: 'Moving soon? Compare trusted local and interstate removalists instantly.',
    url: 'https://www.muval.com.au/',
  }
};

/**
 * Helper function to record a click event (for future analytics integration)
 */
export const trackAffiliateClick = (partnerId, category) => {
  console.log(`[Affiliate Click Tracker] Redirecting to ${partnerId} (${category})`);
  // TODO: Integrate Google Analytics / PostHog here in the future
  // e.g. window.gtag('event', 'affiliate_click', { partner: partnerId, category });
};
