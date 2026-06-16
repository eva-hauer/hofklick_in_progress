import { Component, html, on } from '../../kwm-js/index.js';
import { AppState, saveState, addOrderToDB } from '../db.js';
import { navigate, showToast } from '../router.js';

// Karte mit allen verfügbaren Höfen
class CustomerMap extends Component {
    constructor() {
        super();
        this.mapInitialized = false;
    }

    connectedCallback() {
        super.connectedCallback();
        // Timeout damit die Container-Größe beim ersten Rendern bestimmt werden kann
        if (!this.mapInitialized) {
            setTimeout(() => this.initMap(), 100);
            this.mapInitialized = true;
        }
    }

    initMap() {
        // Startet Karte in Linz (ohne Zoom-Schaltflächen, sodass es für Handy besser passt)
        const map = L.map('leaflet-map', {zoomControl: false}).setView([48.3667, 14.5167], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Setzt für jeden Hof einen Pin
        AppState.farms.get().forEach(farm => {
            const customIcon = L.divIcon({ html: `<div class="custom-map-icon"><img src="${farm.img}"></div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 40] });
            L.marker([farm.lat, farm.lng], {icon: customIcon}).addTo(map).on('click', () => navigate('farm-details', { farmId: farm.id }));
        });
    }

    render() {
        return html`
            <div class="h-full flex flex-col relative">
                <div id="leaflet-map" class="flex-grow z-0 bg-gray-200"></div>
            </div>
            <bottom-nav tab="map"></bottom-nav>
        `;
    }
}
customElements.define('customer-map', CustomerMap);

// Ansicht eines Hofes (alle Produkte sind sichtbar)
class FarmDetails extends Component {
    handleAddToCart(productId) {
        // Sucht Produkt in DB und speichert es in das Warenkorb-Array
        const p = AppState.products.get().find(p => p.id === productId);
        AppState.cart.set([...AppState.cart.get(), p]);
        saveState();
        showToast("Zum Warenkorb hinzugefügt!");
    }

    render() {
        const farmId = this.dataset.farmId;
        const farm = AppState.farms.get().find(f => f.id === farmId);
        // Filtert alle Produkte auf diesen Hof
        const farmProducts = AppState.products.get().filter(p => p.farmId === farmId);

        return html`
            <div class="h-full flex flex-col bg-brand-bg pb-24 overflow-y-auto">
                <div class="relative h-64 bg-gray-200 shrink-0 rounded-b-[40px] overflow-hidden shadow-md">
                    <img src="${farm.img}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 flex flex-col justify-between p-6">
                        <button ${on('click', () => navigate('customer-map'))} class="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-colors text-white">
                            <i class="material-icons">arrow_back</i>
                        </button>
                        <div>
                            <p class="text-brand-beige text-sm font-medium drop-shadow-md mb-1"><i class="material-icons-outlined text-xs">place</i> ${farm.distance} entfernt</p>
                            <h1 class="text-white text-3xl font-bold drop-shadow-lg">${farm.name}</h1>
                        </div>
                    </div>
                </div>
                <div class="p-6 relative z-10 -mt-4">
                    <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2 mb-4">Verfügbare Produkte</h2>
                    <div class="flex flex-col gap-4">
                        ${farmProducts.length === 0 ? html`<div class="bg-white p-6 rounded-2xl text-center text-gray-400 border border-gray-100 shadow-sm"><i class="material-icons-outlined text-4xl mb-2 opacity-50">inventory_2</i><p>Aktuell keine Produkte verfügbar.</p></div>` : ''}
                        ${farmProducts.map(p => html`
                            <div class="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all duration-300">
                                <div class="flex gap-4 mb-3 items-center">
                                    <img src="${p.img}" class="w-16 h-16 rounded-[14px] object-cover border border-gray-100 shrink-0">
                                    <div>
                                        <h3 class="font-bold text-lg text-gray-800 leading-tight">${p.name}</h3>
                                        <p class="text-brand-olive font-extrabold text-sm mt-1 bg-brand-beige/40 inline-block px-2 py-0.5 rounded-lg">${p.price.toFixed(2)} € / ${p.unit}</p>
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mb-4 px-1 line-clamp-2">${p.desc || ''}</p>
                                <button ${on('click', () => this.handleAddToCart(p.id))} class="w-full bg-brand-beige text-brand-oliveDark font-bold py-3 rounded-[16px] flex justify-center items-center gap-2 hover:bg-[#d6d0ad] transition-all">
                                    <i class="material-icons-outlined text-[20px]">add_shopping_cart</i> In den Warenkorb
                                </button>
                            </div>
                        `)}
                    </div>
                </div>
            </div>
            <bottom-nav tab="map"></bottom-nav>
        `;
    }
}
customElements.define('farm-details', FarmDetails);

// Warenkorb und Bestellen
class CustomerCart extends Component {
    handleRemove(index) {
        // Artikel entfernen
        const currentCart = [...AppState.cart.get()];
        currentCart.splice(index, 1);
        AppState.cart.set(currentCart);
        saveState();
    }

    async handleCheckout() {
        const btn = this.querySelector('#checkout-btn');
        btn.innerHTML = `<i class="material-icons animate-spin">refresh</i> BITTE WARTEN...`;
        btn.disabled = true; // Button deaktivieren um Double-Submit zu verhindern

        // Summe berechnen und Bestellung in DB speichern
        const total = AppState.cart.get().reduce((sum, item) => sum + item.price, 0);
        await addOrderToDB({ userId: 'customer1', date: new Date().toISOString(), items: AppState.cart.get(), total: total });

        // Warenkorb leeren und weiter navigieren
        AppState.cart.set([]);
        saveState();
        navigate('checkout-success');
    }

    render() {
        const cart = AppState.cart.get();
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        return html`
            <div class="h-full flex flex-col bg-brand-bg pb-24 overflow-y-auto">
                <div class="bg-white shadow-sm px-6 py-5 sticky top-0 z-40 rounded-b-[30px] mb-4">
                    <h1 class="text-2xl font-bold text-brand-olive flex items-center gap-2"><i class="material-icons-outlined text-3xl">shopping_cart</i> Warenkorb</h1>
                </div>

                <div class="p-6">
                    ${cart.length === 0 ? html`
                        <div class="text-center text-gray-400 mt-16 bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="material-icons-outlined text-5xl opacity-30">remove_shopping_cart</i>
                            </div>
                            <p class="font-medium text-gray-500">Dein Warenkorb ist noch leer.</p>
                            <button ${on('click', () => navigate('customer-map'))} class="text-brand-olive font-bold mt-6 py-3 px-6 bg-brand-beige rounded-full transition-transform inline-block">Höfe entdecken</button>
                        </div>
                    ` : html`
                        <div class="border border-gray-100 rounded-[24px] p-5 bg-white shadow-sm mb-6">
                            ${cart.map((item, index) => html`
                                <div class="flex gap-4 mb-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0 group">
                                    <img src="${item.img}" class="w-14 h-14 rounded-[12px] object-cover border border-gray-100">
                                    <div class="flex-grow">
                                        <p class="font-bold text-gray-800">${item.name}</p>
                                        <p class="text-xs text-brand-olive font-bold mt-0.5">${item.price.toFixed(2)} €</p>
                                    </div>
                                    <button ${on('click', () => this.handleRemove(index))} class="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"><i class="material-icons-outlined text-[20px]">delete</i></button>
                                </div>
                            `)}
                            <div class="flex justify-between items-center font-black text-xl border-t-2 border-dashed border-gray-100 pt-5 mt-2 text-brand-oliveDark">
                                <span>Summe</span>
                                <span>${total.toFixed(2)} €</span>
                            </div>
                        </div>
                        <button id="checkout-btn" ${on('click', () => this.handleCheckout())} class="w-full bg-gradient-to-r from-[#e3b55c] to-[#d4a64d] text-white font-bold py-4 rounded-2xl mt-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg flex justify-center items-center gap-2">
                            <i class="material-icons-outlined">payment</i> JETZT BESTELLEN
                        </button>
                    `}
                </div>
            </div>
            <bottom-nav tab="cart"></bottom-nav>
        `;
    }
}
customElements.define('customer-cart', CustomerCart);

class CheckoutSuccess extends Component {
    render() {
        return html`
            <div class="h-full flex flex-col bg-brand-olive text-white p-8 justify-center items-center text-center relative overflow-hidden">
                <i class="material-icons-outlined text-8xl mb-6 text-brand-beige drop-shadow-lg">check_circle</i>
                <h1 class="text-4xl font-extrabold mb-4 tracking-wide relative z-10">Vielen Dank!</h1>
                <p class="mb-10 text-brand-beige/90 text-lg relative z-10 leading-relaxed">Deine Bestellung wurde erfolgreich an den Hof weitergeleitet.<br>Du findest sie in deinem Profil.</p>
                <button ${on('click', () => navigate('customer-map'))} class="bg-white text-brand-olive font-bold py-4 px-8 rounded-2xl shadow-xl w-full max-w-xs hover:bg-brand-beige hover:-translate-y-1 transition-all relative z-10">ZURÜCK ZUR KARTE</button>
            </div>
            <bottom-nav tab="home"></bottom-nav>
        `;
    }
}
customElements.define('checkout-success', CheckoutSuccess);