/**
 * ConvertSafely Service Worker
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'convertsafely-v1';
const STATIC_CACHE_NAME = 'convertsafely-static-v1';
const DYNAMIC_CACHE_NAME = 'convertsafely-dynamic-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('convertsafely-') &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Firebase and analytics requests
  if (url.hostname.includes('google') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('stripe')) {
    return;
  }

  // Strategy for static assets (Cache First)
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy for FFmpeg.wasm files (Network First with long cache)
  if (url.pathname.includes('@ffmpeg') || url.pathname.endsWith('.wasm')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Strategy for API requests (Network Only)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Default strategy: Network First with Cache Fallback
  event.respondWith(networkFirstWithCache(request));
});

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.json'
  ];
  
  const url = new URL(request.url);
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Cache First strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

/**
 * Network First with Cache strategy
 * Try network first, fall back to cache
 */
async function networkFirstWithCache(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // If it's a navigation request, return the offline page
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

/**
 * Background Sync for conversion tasks
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'conversion-sync') {
    event.waitUntil(syncConversions());
  }
});

async function syncConversions() {
  // This would sync any pending conversions when back online
  console.log('[SW] Syncing pending conversions...');
}

/**
 * Push notifications (for subscription reminders)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'ConvertSafely notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ConvertSafely',
      options
    )
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const notification = event.notification;
  
  if (action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

/**
 * Message handler from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_CONVERSION') {
    // Cache conversion result for offline access
    const { url, blob } = event.data;
    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
      const response = new Response(blob);
      cache.put(url, response);
    });
  }
});

console.log('[SW] Service Worker loaded');
