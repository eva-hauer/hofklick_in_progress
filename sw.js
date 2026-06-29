//Der Service Worker für das Ofline-Caching. Er fängt Netzwerkanfragen ab und
// wenn das Internet ausfällt, liefert er gecachte Dateien aus. Firestore-Netzwerkanfragen
// werden vom Service Worker ignoriert, da Firebase sein eigenes Offline-Caching mitbringt
// und es sonst zu Konflikten kommen könnte.

// Grundlegende Funktionsweise:
// Fetch-Anfragen (wie das Laden von HTML, CSS, JS) werden vom Service Worker abgefangen,
// was die Basis für Offline-Fähigkeit und Caching bildet.

const CACHE_NAME = "hofwaerts-cache-v4";  // Versionierung des Caches bei Dateiänderungen
const CACHED_URLS = [
    "/",
    "index.html",
    "css/styles.css",
    "js/app.js",
    "js/db.js",
    "js/router.js",
    "js/tailwind-config.js",
    "js/components/navigation.js",
    "js/components/auth.js",
    "js/components/farmer.js",
    "js/components/customer.js",
    "manifest.webmanifest",

    "images/BauerAuer.png",
    "images/BauerMayr.png",
    "images/Bauern.png",
    "images/hofklick-logo-192.png",
    "images/hofklick-logo-512.png",
    "images/Hofklick_Logo.png",
    "images/Karte.png",
    "images/Konsumenten.png",
    "images/Kunde.png"
];

// Installation: Lädt alle definierten Dateien in den Cache vor
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(c) {
            return c.addAll(CACHED_URLS);
        }).catch((err)=>{
            console.error("Fehler beim Vorladen des Caches:", err);
        })
    );
});

// Fetch-Event: Network-First-Strategie mit Cache-Fallback
self.addEventListener("fetch", function(event) {
    // Firestore-Datenbankabfragen vom Caching ausschließen,
    // da Firebase einen eigenen lokalen Cache für Firestore verwaltet.
    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            // Wenn keine Netzwerkverbindung besteht, versuche die Datei aus dem Cache zu laden
            return caches.match(event.request).then(function(response) {
                return response;
            });
        })
    );
});

// Aktivierung: Bereinigt alte Caches bei Versionsänderungen
self.addEventListener("activate",(event)=>{
    event.waitUntil(
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.map((cacheName)=>{
                    // Löscht nur alte Cache-Versionen, die zum Projekt gehören
                    if(CACHE_NAME !== cacheName && cacheName.startsWith("hofwaerts-cache")){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});