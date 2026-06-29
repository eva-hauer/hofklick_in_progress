// Initialisiert die App. Registriert den Service Worker, importiert alle Komponenten
// und aktiviert den Router

import './db.js';
import './router.js';
// KWM-JS Komponenten laden
import './components/navigation.js';
import './components/auth.js';
import './components/farmer.js';
import './components/customer.js';
import { navigate } from './router.js';

// Service Worker für PWA-Funktionalität (Caching, ...) registrieren
if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(
        registration => { console.log("SW registered"); }
    ).catch(error => { console.error("Could not register SW", error); });
}

// Letzte besuchte Route aus LocalStorage laden, man bei Reload nicht wieder auf der Startseite landet (typisches App-Verhalten)
const savedRoute = JSON.parse(localStorage.getItem('hofwaerts-route')) || { view: 'start', data: {} };
navigate(savedRoute.view, savedRoute.data);