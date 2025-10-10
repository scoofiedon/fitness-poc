const CACHE_NAME = 'fitness-poc-v1';
const MODEL_CACHE_NAME = 'fitness-poc-models-v1';

// URLs to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/src/router/index.js',
  '/manifest.json'
];

// URLs for model caching
const modelUrls = [
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
];

// Install event - cache core assets and model
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Cache the model
        return caches.open(MODEL_CACHE_NAME);
      })
      .then(modelCache => {
        return modelCache.addAll(modelUrls);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event - serve cached content when available
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API/model requests
  if (event.request.url.includes('pose_landmarker_full.task') || 
      event.request.url.includes('mediapipe') ||
      event.request.url.includes('tasks-vision')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            console.log('Serving model from cache:', event.request.url);
            return response;
          }
          
          // Not in cache - fetch from network
          console.log('Fetching model from network:', event.request.url);
          return fetch(event.request).then(response => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as streams can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(MODEL_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
    );
    return;
  }

  // Handle navigation requests (SPA routes)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});