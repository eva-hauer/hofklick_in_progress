import { Component, html, on } from '../../kwm-js/index.js';
import { AppState } from '../db.js';
import { navigate } from '../router.js';

// Zentrales Navigationselement (wird in fast allen Views unten eingebunden)
class BottomNav extends Component {
    render() {
        const activeTab = this.getAttribute('tab');
        const role = AppState.userRole.get();
        // Dynamische CSS-Klassen für den aktiven bzw. inaktiven State
        const baseClass = "p-2 px-5 rounded-2xl flex justify-center items-center transition-all duration-300";
        const activeClass = `${baseClass} bg-brand-olive text-white shadow-md transform -translate-y-1`;
        const inactiveClass = `${baseClass} text-brand-olive/60 bg-transparent hover:bg-brand-beige hover:text-brand-olive`;

        let navItems = '';

        // Layout ändert sich je nachdem, ob Landwirt oder Kunde eingeloggt ist
        if (role === 'farmer') {
            navItems = html`
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('farmer-dashboard'))}>
                    <div class="${activeTab === 'home' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'home' ? '' : '-outlined'} text-[28px]">home</i></div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('farmer-products'))}>
                    <div class="${activeTab === 'products' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'products' ? '' : '-outlined'} text-[28px]">grid_view</i></div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('placeholder', {title: 'Kalender', tab: 'calendar'}))}>
                    <div class="${activeTab === 'calendar' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'calendar' ? '' : '-outlined'} text-[28px]">calendar_today</i></div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('profile'))}>
                    <div class="${activeTab === 'profile' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'profile' ? '' : '-outlined'} text-[28px]">person</i></div>
                </div>
            `;
        } else {
            // Roter Punkt für Warenkorb-Anzahl
            const cartCount = AppState.cart.get().length;
            navItems = html`
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('placeholder', {title: 'Startseite', tab: 'home'}))}>
                    <div class="${activeTab === 'home' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'home' ? '' : '-outlined'} text-[28px]">home</i></div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('customer-map'))}>
                    <div class="${activeTab === 'map' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'map' ? '' : '-outlined'} text-[28px]">location_on</i></div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('customer-cart'))}>
                    <div class="relative ${activeTab === 'cart' ? activeClass : inactiveClass}">
                        <i class="material-icons${activeTab === 'cart' ? '' : '-outlined'} text-[28px]">shopping_cart</i>
                        ${cartCount > 0 ? html`<span class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-beige animate-pulse">${cartCount}</span>` : ''}
                    </div>
                </div>
                <div class="flex-1 flex justify-center cursor-pointer" ${on('click', () => navigate('profile'))}>
                    <div class="${activeTab === 'profile' ? activeClass : inactiveClass}"><i class="material-icons${activeTab === 'profile' ? '' : '-outlined'} text-[28px]">person</i></div>
                </div>
            `;
        }

        return html`<nav class="fixed bottom-0 w-full max-w-[430px] bg-brand-beige/95 backdrop-blur-md flex justify-around items-center h-[80px] rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-[1000] px-2 pb-2">${navItems}</nav>`;
    }
}

customElements.define('bottom-nav', BottomNav);