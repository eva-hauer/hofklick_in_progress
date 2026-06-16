const CACHE_NAME = "hofwaerts-cache-v2";

self.addEventListener("fetch", function(event) {
    // DB Requests werden nicht gecached, da das die DB schon selbst übernimmt
    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    // Bei anderen Requests wird zuerst aus dem Netzwerk geladen und wenn das nicht verfügbar ist,
    // dann aus dem Cache (Offline-Funktionalität)
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })
    );
});

self.addEventListener("activate", function(event) {
    // Alte Cache-Versionen löschen, um Speicherplatz zu sparen und Konflikte zu vermeiden
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (CACHE_NAME !== cacheName && cacheName.startsWith("hofwaerts-cache")) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});