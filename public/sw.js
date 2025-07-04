// Service Worker for caching and performance
const CACHE_NAME = 'sustainability-platform-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/api/sdgs',
  '/api/projects'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Cache images and static assets
            if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif|css|js)$/)) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return fetchResponse;
          });
      })
  );
});