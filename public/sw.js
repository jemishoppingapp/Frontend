/* JEMI — self-destructing service worker.
 *
 * This SW exists for ONE reason: clean up after any prior service worker
 * registered by the Vite-era app. On install, it activates immediately;
 * on activate, it deletes all caches AND unregisters itself.
 *
 * Returning visitors who had the old SW installed get a one-time visit
 * where their browser swaps to this SW, this SW wipes everything, then
 * removes itself. Next visit is a clean fetch from the Next.js app.
 */

self.addEventListener('install', (event) => {
  // Activate immediately — don't wait for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Take control of all open clients (tabs) immediately.
      await self.clients.claim();

      // Wipe every cache this origin owns.
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister ourselves. The next navigation will be a clean fetch.
      await self.registration.unregister();

      // Force-reload any open tabs so they pick up the fresh app.
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});

/* No fetch handler — all requests go to the network. */