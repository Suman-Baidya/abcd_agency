// Service Worker for ABCD Agency PWA (v1.5 - Push Notifications Enabled)
const CACHE_NAME = "abcd-agency-cache-v1.5";
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/manifest.json",
  "/images/abcd_square_logo.png",
  "/images/White_Logo.png",
  "/images/Black_Logo.png",
];

// Install Event - Pre-cache core shell & offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Allow the new service worker to take over immediately when requested
  self.skipWaiting();
});

// Activate Event - Clean up stale cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[PWA] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message listener for skipWaiting / manual update trigger
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch Event (Network-first with Cache Fallback for dynamic dashboards)
self.addEventListener("fetch", (event) => {
  // Skip non-GET or cross-origin requests
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API routes, auth callbacks, and server actions
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static assets and HTML pages
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is for an HTML page navigation, return pre-cached offline.html
          if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/offline.html");
          }
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});

// =========================================================================
// PUSH NOTIFICATIONS (Android Notification Bar, Desktop & iOS)
// =========================================================================

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "ABCD Agency", body: event.data.text() };
    }
  }

  const title = data.title || "ABCD Agency Alert";
  const options = {
    body: data.body || "New update in your project dashboard.",
    icon: data.icon || "/images/abcd_square_logo.png",
    badge: data.badge || "/favicon.ico",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || `abcd-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || "/portal",
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: "open", title: "Open App" }
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open on this origin, focus it and navigate
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          if ("navigate" in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
