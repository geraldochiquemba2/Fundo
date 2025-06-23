// Performance optimization utilities

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private preloadPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Preload critical resources
  preloadCriticalData(): void {
    const criticalEndpoints = ['/api/sdgs', '/api/projects'];
    
    criticalEndpoints.forEach(endpoint => {
      if (!this.preloadPromises.has(endpoint)) {
        const promise = fetch(endpoint)
          .then(res => res.json())
          .catch(err => {
            console.warn(`Failed to preload ${endpoint}:`, err);
            return null;
          });
        
        this.preloadPromises.set(endpoint, promise);
      }
    });
  }

  // Get preloaded data or fetch if not available
  async getPreloadedData(endpoint: string): Promise<any> {
    if (this.preloadPromises.has(endpoint)) {
      return this.preloadPromises.get(endpoint);
    }
    
    // If not preloaded, fetch normally
    const response = await fetch(endpoint);
    return response.json();
  }

  // Prefetch images
  prefetchImages(urls: string[]): void {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  // Optimize for first visit
  optimizeFirstVisit(): void {
    // Start preloading immediately
    this.preloadCriticalData();
    
    // Prefetch common images
    this.prefetchImages([
      '/uploads/projects/',
      '/company-logos/'
    ]);

    // Warm up service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker not available, continue normally
      });
    }
  }

  // Performance monitoring
  measurePageLoad(): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;
          
          console.log(`Page load time: ${loadTime}ms`);
          
          // Send analytics if needed
          if (loadTime > 3000) {
            console.warn('Page load time is slow:', loadTime);
          }
        }, 100);
      });
    }
  }
}

// Initialize performance optimizer
export const performanceOptimizer = PerformanceOptimizer.getInstance();