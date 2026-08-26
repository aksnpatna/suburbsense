import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics(consent = false) {
  const location = useLocation();

  useEffect(() => {
    if (!consent) return;

    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer || null
          }),
        });
      } catch {
        // Silently fail — analytics should never break the app
      }
    };
    trackPageView();
  }, [location.pathname, consent]);
}
