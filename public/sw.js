const CACHE = 'desfralde-static-v1'

const PRECACHE = [
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-16.png',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/manifest.webmanifest',
  '/pecs/ajuda.jpg',
  '/pecs/banheiro.jpg',
  '/pecs/calca.jpg',
  '/pecs/coco-pedido.jpg',
  '/pecs/descarga.jpg',
  '/pecs/fazer-coco.jpg',
  '/pecs/fazer-xixi.jpg',
  '/pecs/ir-banheiro.jpg',
  '/pecs/lavar-maos.jpg',
  '/pecs/papel.jpg',
  '/pecs/personagem.jpg',
  '/pecs/pronto.jpg',
  '/pecs/secar-maos.jpg',
  '/pecs/sentar.jpg',
  '/pecs/subir-calca.jpg',
  '/pecs/xixi-pedido.jpg',
]

const STATIC_EXT =
  /\.(?:png|jpe?g|gif|svg|ico|webp|woff2?|ttf|css|js|webmanifest)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
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
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/_')) return
  if (request.mode === 'navigate') return

  const cacheable =
    STATIC_EXT.test(url.pathname) || url.pathname.startsWith('/assets/')
  if (!cacheable) return

  event.respondWith(cacheFirst(request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  }
  return response
}
