import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollToTop component - scrolls to top of page on route change
 */
export default function ScrollToTop() {
  // Get current location from wouter
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top of page when location changes
    window.scrollTo(0, 0);
  }, [location]);
  
  // This component doesn't render anything
  return null;
}