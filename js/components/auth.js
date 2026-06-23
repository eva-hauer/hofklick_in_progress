import { Component, html, on } from '../../kwm-js/index.js';
import { AppState, saveState } from '../db.js';
import { navigate, showToast } from '../router.js';

// Start-Ansicht (Auswahl ob Landwirt oder Kunde)
class AppStart extends Component {
    render() {
        return html`
            <div class="h-full flex flex-col bg-black">
                <div class="flex-1 relative cursor-pointer group overflow-hidden" ${on('click', () => navigate('login', {role: 'farmer'}))}>
                    <img src="images/Bauern.png" class="absolute inset-0 w-full h-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end pb-20 transition duration-300">
                        <div class="bg-brand-beige text-brand-oliveDark font-bold text-xl py-4 px-8 rounded-2xl shadow-2xl text-center transform transition duration-500 group-hover:-translate-y-2 w-3/4">Als Landwirt:in<br>starten</div>
                    </div>
                </div>
                <div class="w-full h-1 bg-brand-olive z-10 shadow-lg"></div>
                <div class="flex-1 relative cursor-pointer group overflow-hidden" ${on('click', () => navigate('login', {role: 'customer'}))}>
                    <img src="images/Konsumenten.png" class="absolute inset-0 w-full h-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-end pb-20 transition duration-300">
                        <div class="bg-brand-olive text-brand-beige font-bold text-xl py-4 px-8 rounded-2xl shadow-2xl text-center transform transition duration-500 group-hover:-translate-y-2 w-3/4">Als Kund:in<br>starten</div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('app-start', AppStart);

// Login: Speichert gewählte Rolle im App-State
class AppLogin extends Component {
    handleLogin(e) {
        e.preventDefault();
        const role = this.dataset.role;
        AppState.userRole.set(role);
        saveState();
        showToast("Erfolgreich angemeldet!");
        // Rollenspezifisches Routing nach Login
        if (role === 'farmer') navigate('farmer-products');
        else navigate('customer-home');
    }

    render() {
        const isFarmer = this.dataset.role === 'farmer';
        return html`
            <div class="h-full flex flex-col relative bg-white">
                <div class="px-6 py-4 flex items-center">
                    <button ${on('click', () => navigate('start'))} class="hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center text-gray-700">
                        <i class="material-icons-outlined">arrow_back</i>
                    </button>
                </div>
                <div class="flex flex-col items-center mt-10 mb-10">
                    <div class="text-7xl mb-4 drop-shadow-md">
                        <img src="images/Hofklick_Logo.png"></div>
                    <h1 class="text-3xl font-extrabold text-brand-olive tracking-widest uppercase">Hofklick</h1>
                    <p class="text-gray-500 font-medium mt-2">${isFarmer ? 'Login für Landwirt*innen' : 'Login für Kund*innen'}</p>
                </div>
                <form ${on('submit', (e) => this.handleLogin(e))} class="flex flex-col gap-5 px-8">
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase ml-2">E-Mail</label>
                        <input type="email" value="${isFarmer ? 'musterbauer@gmail.com' : 'monamusterfrau@gmail.com'}" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 mt-1 outline-none focus:border-brand-olive focus:bg-white transition-all">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase ml-2">Passwort</label>
                        <input type="password" value="********" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 mt-1 outline-none focus:border-brand-olive focus:bg-white transition-all">
                    </div>
                    <button type="submit" class="w-full bg-brand-olive hover:bg-brand-oliveDark transition-all duration-300 text-white font-bold rounded-2xl p-4 mt-4 shadow-md text-lg">Anmelden</button>
                </form>
            </div>
        `;
    }
}
customElements.define('app-login', AppLogin);

// Profil: Beim Logout wird die Rolle aus dem App-State wieder gelöscht
class AppProfile extends Component {
    handleLogout() {
        AppState.userRole.set(null);
        AppState.cart.set([]);
        saveState();
        navigate('start');
        showToast("Erfolgreich abgemeldet");
    }

    render() {
        const isFarmer = AppState.userRole.get() === 'farmer';
        const bgImg = isFarmer ? 'images/BauerAuer.png' : 'images/Kunde.jpg';
        // Bestellungen werden je nach User gefiltert
        const myOrders = isFarmer ? [] : AppState.orders.get().filter(o => o.userId === 'customer1');

        return html`
            <div class="h-full flex flex-col bg-brand-bg pb-24 overflow-y-auto">
                <div class="relative h-64 bg-gray-200 shrink-0 rounded-b-[40px] overflow-hidden shadow-sm">
                    <img src="${bgImg}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div class="absolute top-6 right-6 flex flex-col items-end gap-3 text-white z-10">
                        <button ${on('click', () => this.handleLogout())} class="flex items-center gap-2 hover:bg-white/20 transition-all bg-black/30 p-2.5 px-5 rounded-full backdrop-blur-md border border-white/20">
                            <span class="font-bold text-sm">Abmelden</span>
                            <i class="material-icons-outlined text-lg">logout</i>
                        </button>
                    </div>
                    <div class="absolute bottom-8 left-8 text-white z-10">
                        <h1 class="text-3xl font-bold mb-1 drop-shadow-md">${isFarmer ? 'Bauer Auer' : 'Mona Musterfrau'}</h1>
                        <p class="text-brand-beige font-medium opacity-90 drop-shadow-md flex items-center gap-1">
                            <i class="material-icons text-sm">verified</i> ${isFarmer ? 'Landwirt:in' : 'Premium Kund:in'}
                        </p>
                    </div>
                </div>

                <div class="p-6 flex flex-col gap-8 -mt-4 relative z-20">
                    <div>
                        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2 mb-2">Benutzerkonto</h2>
                        <div class="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
                            <div class="w-12 h-12 bg-brand-beige text-brand-olive rounded-full flex items-center justify-center font-bold text-xl">${isFarmer ? 'B' : 'M'}</div>
                            <div>
                                <p class="text-xs text-gray-400 uppercase font-bold">E-Mail Adresse</p>
                                <p class="text-gray-800 font-bold">${isFarmer ? 'musterbauer@gmail.com' : 'monamusterfrau@gmail.com'}</p>
                            </div>
                        </div>
                    </div>

                    ${!isFarmer ? html`
                        <div>
                            <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2 mb-2 flex items-center gap-2">Historie</h2>
                            ${myOrders.length === 0 ? html`
                                <div class="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 text-center text-gray-400">
                                    <i class="material-icons-outlined text-4xl mb-2 opacity-50">receipt_long</i>
                                    <p class="font-medium text-sm">Noch keine Bestellungen aufgegeben.</p>
                                </div>
                            ` : html`
                                <div class="flex flex-col gap-4">
                                    ${myOrders.map(order => {
                                        const dateStr = new Date(order.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
                                        return html`
                                            <div class="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                                    <span class="font-bold text-gray-800 text-sm flex items-center gap-2"><i class="material-icons-outlined text-brand-olive text-[18px]">calendar_today</i> ${dateStr}</span>
                                                    <span class="font-bold text-brand-olive bg-brand-beige px-3 py-1 rounded-full text-xs">${order.total.toFixed(2)} €</span>
                                                </div>
                                                <ul class="text-sm text-gray-500 space-y-1.5 ml-1">
                                                    ${order.items.map(item => html`<li class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div> ${item.name}</li>`)}
                                                </ul>
                                            </div>
                                        `})}
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>
            </div>
            <bottom-nav tab="profile"></bottom-nav>
        `;
    }
}
customElements.define('app-profile', AppProfile);

class AppPlaceholder extends Component {
    render() {
        const title = this.dataset.title || 'In Arbeit';
        const tab = this.dataset.tab || '';
        const ctaView = AppState.userRole.get() === 'farmer' ? 'farmer-dashboard' : 'customer-map';
        const ctaText = AppState.userRole.get() === 'farmer' ? 'Zur Startseite' : 'Zur Karte';

        return html`
            <div class="h-full flex flex-col bg-brand-bg pb-20 justify-center items-center text-center px-6">
                <i class="material-icons-outlined text-6xl text-gray-300 mb-4">construction</i>
                <h1 class="text-2xl font-bold text-gray-400 mb-2">${title}</h1>
                <p class="text-gray-400 text-sm mb-8">Dieser Bereich kommt bald.</p>
                <button ${on('click', () => navigate(ctaView))} class="bg-brand-beige text-brand-olive font-bold py-3 px-8 rounded-xl shadow-sm hover:scale-105 transition-transform">
                    ${ctaText}
                </button>
            </div>
            <bottom-nav tab="${tab}"></bottom-nav>
        `;
    }
}
customElements.define('app-placeholder', AppPlaceholder);