// Lazy loading utilities for improved performance

export class LazyLoadManager {
  private static instance: LazyLoadManager;
  private observer: IntersectionObserver | null = null;
  
  static getInstance(): LazyLoadManager {
    if (!LazyLoadManager.instance) {
      LazyLoadManager.instance = new LazyLoadManager();
    }
    return LazyLoadManager.instance;
  }
  
  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.getAttribute('data-src');
              
              if (src) {
                // Preload image
                const tempImg = new Image();
                tempImg.onload = () => {
                  img.src = src;
                  img.classList.add('loaded');
                  img.removeAttribute('data-src');
                };
                tempImg.src = src;
                
                // Stop observing this image
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before visible
          threshold: 0.01
        }
      );
    }
  }
  
  observe(element: HTMLImageElement): void {
    if (this.observer && element.getAttribute('data-src')) {
      this.observer.observe(element);
    }
  }
  
  observeAll(selector: string = 'img[data-src]'): void {
    if (typeof document === 'undefined') return;
    
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    images.forEach(img => this.observe(img));
  }
  
  disconnect(): void {
    this.observer?.disconnect();
  }
}

// Utility function to convert regular images to lazy loaded
export function setupLazyImage(
  src: string,
  placeholder?: string,
  className?: string
): React.ImgHTMLAttributes<HTMLImageElement> & { 'data-src'?: string } {
  return {
    'data-src': src,
    src: placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3C/svg%3E',
    className: `transition-opacity duration-300 ${className || ''}`,
    loading: 'lazy' as const,
    decoding: 'async' as const
  };
}

export const lazyLoader = LazyLoadManager.getInstance();