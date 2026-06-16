import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, initializeFirestore, persistentLocalCache, persistentMultipleTabManager }
    from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { observable } from '../kwm-js/index.js';

// Firebase Datenbank Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyAdd8NJHydsV0twmzmNAAJhT8TczOsjzgs",
    authDomain: "hofklick.firebaseapp.com",
    projectId: "hofklick",
    storageBucket: "hofklick.firebasestorage.app",
    messagingSenderId: "507199537890",
    appId: "1:507199537890:web:6a26f5b93d6d881c1754bb"
};

// Offline Cache: persistentLocalCache speichert alle aus der DB ausgelesenen Daten lokal im Browser
// Wenn Internetverbindung wegfällt, wird es aus dem Cache geladen bzw. neue Daten
// werden lokal zwischengespeichert und automatisch synchronisiert, wenn Verbindung wieder da ist
// persistentMultipleTabManager verhindert, dass die App abstürzt, wenn sie in mehreren Tabs gleichzeitig geöffnet ist
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const savedState = JSON.parse(localStorage.getItem('hofwaerts-state')) || {};

// Zentraler App-State: Alle App-übergreifenden Daten liegen an einem zentralen Ort.
// Observables sorgen dafür, dass das UI automatisch upgedatet wird, wenn sich Daten ändern
export const AppState = {
    userRole: observable(savedState.userRole || null),
    cart: observable(savedState.cart || []),
    farms: observable([
        // Dummy-Daten für Landwirte
        { id: 'f1', name: 'Bio Bauer Auer', lat: 48.3667, lng: 14.5167, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=150&fit=crop', distance: '2 km' },
        { id: 'f2', name: 'Hofladen Müller', lat: 48.35, lng: 14.5, img: 'https://images.unsplash.com/photo-1595856754020-007eb78eb8fc?w=150&h=150&fit=crop', distance: '5 km' }
    ]),
    products: observable([]),
    orders: observable([])
};

// Speichert aktuelle Rolle des Users & den Warenkorb in den LocalStorage
export function saveState() {
    localStorage.setItem('hofwaerts-state', JSON.stringify({
        userRole: AppState.userRole.get(),
        cart: AppState.cart.get()
    }));
}

// Automatisches Aktualisieren, wenn sich Daten in der DB ändern
onSnapshot(collection(db, 'products'), (snapshot) => {
    const loadedProducts = [];
    snapshot.docs.forEach(doc => loadedProducts.push({ ...doc.data(), id: doc.id }));
    AppState.products.set(loadedProducts);
});

onSnapshot(collection(db, 'orders'), (snapshot) => {
    const loadedOrders = [];
    snapshot.docs.forEach(doc => loadedOrders.push({ ...doc.data(), id: doc.id }));
    loadedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    AppState.orders.set(loadedOrders);
});

// DB-Befehle werden in Funktionen gekapselt, sodass man später nur die Funktion aufrufen muss und nicht das ganze mit await
export async function addProductToDB(productData) { await addDoc(collection(db, 'products'), productData); }
export async function updateProductInDB(productId, productData) { await updateDoc(doc(db, 'products', productId), productData); }
export async function deleteProductFromDB(productId) { await deleteDoc(doc(db, 'products', productId)); }
export async function addOrderToDB(orderData) { await addDoc(collection(db, 'orders'), orderData); }