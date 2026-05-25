const CACHE_NAME = 'snapeats-shell-v2';
const API_CACHE_NAME = 'snapeats-api-v2';
const APP_SHELL_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/LogoSnapEats.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ status: 'offline', message: 'Tidak ada koneksi internet.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isApiRequest = url.origin === self.location.origin && url.pathname.startsWith('/api/');
  const isAppAsset = url.origin === self.location.origin && !isApiRequest;

  if (isApiRequest) {
    event.respondWith(networkFirst(request, API_CACHE_NAME));
    return;
  }

  if (isAppAsset) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});
