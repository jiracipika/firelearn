// FireLearn service worker
//
// Strategy overview
// -----------------
//  - PRECACHE: a minimal app shell (landing + the dedicated offline page).
//    Listed explicitly so install never fails on a 404 for a deeper route.
//  - STATIC ASSET CACHE (JS/CSS chunks, fonts, images from our origin):
//    stale-while-revalidate. These are content-hashed so serving a cached copy
//    is always safe; a fresh fetch runs in the background to keep it current.
//    This is what makes offline pages render *styled* instead of bare HTML.
//  - NAVIGATION CACHE: HTML document requests (same-origin GET). On a cache
//    hit we serve the cached page and revalidate in the background; on a miss
//    we fall through to the network, and if that fails we serve /offline.
//  - Everything else (POST, Supabase API, cross-origin) is passed straight
//    through to the network — we never cache auth or progress writes.

const VERSION = 'firelearn-offline-v2'
const STATIC_CACHE = `${VERSION}-assets`
const NAV_CACHE = `${VERSION}-navigations`
const OFFLINE_URL = '/offline'

// Minimal, always-safe precache list. Deeper routes (lessons, quiz, flashcards)
// enter NAV_CACHE as the user visits them.
const PRECACHE_URLS = ['/', OFFLINE_URL]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isSameOrigin(request) {
  return new URL(request.url, self.location.href).origin === self.location.origin
}

function isStaticAsset(request) {
  if (request.method !== 'GET') return false
  const url = new URL(request.url, self.location.href)
  if (url.origin !== self.location.origin) return false
  const pathname = url.pathname
  // Hashed build chunks, fonts, images, icons, manifests, etc.
  if (pathname.startsWith('/_next/static/')) return true
  if (pathname.startsWith('/_next/')) return false // /_next/data may change
  return /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|gif|webp|svg|ico|webmanifest)$/.test(pathname)
}

// Stale-while-revalidate for hashed static assets. Caches are updated in the
// background; the caller gets the fastest available copy.
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => undefined)
      }
      return response
    })
    .catch(() => undefined)
  // Serve cache immediately when present, otherwise wait on the network.
  return cached || network
}

async function handleNavigation(request) {
  const cache = await caches.open(NAV_CACHE)
  const cached = await cache.match(request, { ignoreSearch: true })
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone()).catch(() => undefined)
      }
      return response
    })
    .catch(async () => {
      // Offline: prefer the exact cached page, then any cached navigation,
      // then the dedicated offline page.
      const exact = await cache.match(request)
      if (exact) return exact
      const anyNav = await cache.match('/').catch(() => undefined)
      if (anyNav) return anyNav
      return (await caches.match(OFFLINE_URL)) || Response.error()
    })

  // Revalidate cached navigations in the background; on a fresh load, fall
  // through to the network directly.
  if (cached) {
    network.catch(() => undefined) // kick off background revalidation
    return cached
  }
  return network
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  // Never intercept Supabase or other cross-origin API traffic.
  if (!isSameOrigin(request)) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  // Default: let the browser handle it.
})

// Activate the new SW immediately after install across all tabs.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
