// Service Worker for GitAccountable PWA
const CACHE_NAME = 'gitaccountable-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Font and CSS assets to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap',
  'https://cdn.remixicon.com/releases/v2.5.0/remixicon.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async function() {
      try {
        console.log('Service worker installing caches');
        const cache = await caches.open(CACHE_NAME);
        
        // Cache local assets one by one to prevent failures from stopping the process
        for (const asset of ASSETS_TO_CACHE) {
          try {
            await cache.add(asset);
            console.log(`Cached asset: ${asset}`);
          } catch (err) {
            console.error(`Failed to cache asset ${asset}:`, err);
            // Continue caching other assets even if one fails
          }
        }
        
        // Cache external assets
        for (const url of EXTERNAL_ASSETS) {
          try {
            const response = await fetch(url, { 
              mode: 'no-cors',  // This helps with CORS issues
              credentials: 'omit' // Safer for external resources
            });
            if (response) {
              await cache.put(url, response);
              console.log(`Cached external resource: ${url}`);
            }
          } catch (err) {
            console.error(`Failed to cache external resource ${url}:`, err);
            // Continue with other external assets
          }
        }
        
        console.log('Service worker installation complete');
      } catch (error) {
        console.error('Failed to complete service worker installation:', error);
        // Even if there are errors, let the service worker continue to install
      }
    })()
  );
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Service worker deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache or fetch from network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  try {
    const requestUrl = new URL(event.request.url);
    
    // Handle navigation requests - serve offline.html when offline
    if (event.request.mode === 'navigate') {
      event.respondWith(
        (async () => {
          try {
            // Try network first for navigation requests
            const networkResponse = await fetch(event.request);
            return networkResponse;
          } catch (error) {
            // If network fails, serve from cache
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If nothing in cache, serve offline page
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) {
              return offlinePage;
            }
            
            // Last resort fallback
            return new Response('You are offline and the offline page is not available.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          }
        })()
      );
      return;
    }
    
    // Handle API requests - don't cache, always get fresh data
    if (requestUrl.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => response)
          .catch(error => {
            console.error('API fetch failed:', error);
            return new Response(JSON.stringify({ error: 'You are offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
      return;
    }
    
    // Static assets - cache first, network fallback
    event.respondWith(
      (async () => {
        try {
          // Check the cache first
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          // If not in cache, try network
          console.log('Fetching from network:', event.request.url);
          const networkResponse = await fetch(event.request);
          
          // Cache valid responses for future use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);
            console.log('Cached new resource:', event.request.url);
          }
          
          return networkResponse;
        } catch (error) {
          console.error('Fetch failed:', error);
          
          // If it's an image, try to return a placeholder
          if (event.request.destination === 'image') {
            return caches.match('/icons/icon-192x192.png');
          }
          
          // Return a simple text error for other resources
          return new Response('Resource unavailable while offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
  } catch (error) {
    console.error('Service worker fetch error:', error);
    // Do not throw, just continue without service worker intervention
  }
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from GitAccountable',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'GitAccountable', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // This will open the app when the notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If client already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});