const CACHE_NAME = 'rx-autos-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/veiculos',
  '/planos',
  '/simulador',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Instalar o service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Buscar recursos
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna resposta
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Ativar o service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Escutar mensagens para atualização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificações push (futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/images/rxveiculos.png',
    badge: '/images/rxveiculos.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'Ver Veículos',
        icon: '/images/rxveiculos.png'
      },
      {
        action: 'close', 
        title: 'Fechar',
        icon: '/images/rxveiculos.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RX Autos', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/veiculos')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 