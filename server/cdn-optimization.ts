import { Request, Response, NextFunction } from 'express';
import { log } from './vite';

// CDN and static file optimization
export function optimizeStaticFiles() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set aggressive caching for static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    
    // Optimize image responses
    if (req.path.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      res.setHeader('Vary', 'Accept');
      res.setHeader('Content-Type', 'image/*');
    }
    
    next();
  };
}

// Enable HTTP/2 server push for critical resources
export function enableServerPush() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' || req.path === '/index.html') {
      // Push critical CSS and JS
      res.setHeader('Link', [
        '</static/css/main.css>; rel=preload; as=style',
        '</static/js/main.js>; rel=preload; as=script',
        '</api/sdgs>; rel=prefetch',
        '</api/projects>; rel=prefetch'
      ].join(', '));
    }
    next();
  };
}

// Optimize for mobile devices
export function optimizeForMobile() {
  return (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    if (isMobile) {
      // Shorter cache times for mobile to ensure fresh content
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      res.setHeader('X-Mobile-Optimized', 'true');
    }
    
    // Enable compression for mobile
    res.setHeader('Vary', 'Accept-Encoding, User-Agent');
    
    next();
  };
}