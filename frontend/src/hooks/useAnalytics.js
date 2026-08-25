import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch('/api/page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ page: location.pathname }),
        });
      } catch {
        // Silently fail — analytics should never break the app
      }
    };
    trackPageView();
  }, [location.pathname]);
}
