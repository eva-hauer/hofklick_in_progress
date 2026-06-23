const appRoot = document.getElementById('app-root');

// UI Elemente, die öfter gebraucht werden sind hier an 1 Stelle definiert
export function showToast(message, type = 'success') {
    // Baut ein HTML-Popup zusammen und entfernt es nach 3 Sekunden wieder
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-brand-olive' : 'bg-red-500';
    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold shadow-xl z-[2000] transition-all duration-300 transform -translate-y-10 opacity-0 ${bgColor} whitespace-nowrap text-sm`;
    toast.innerText = message;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('-translate-y-10', 'opacity-0'));

    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function showModal(title, message, confirmText, onConfirm) {
    // Erzeugt ein Overlay (z.B. Sicherheitsabfrage vor dem Löschen)
    const modalBg = document.createElement('div');
    modalBg.className = 'fixed inset-0 bg-black/50 z-[3000] flex justify-center items-center opacity-0 transition-opacity duration-300';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-2xl p-6 m-4 max-w-[350px] w-full transform scale-95 transition-transform duration-300 shadow-xl';

    modalContent.innerHTML = `
        <h3 class="text-xl font-bold text-brand-olive mb-2">${title}</h3>
        <p class="text-gray-600 mb-6 text-sm">${message}</p>
        <div class="flex gap-3 justify-end">
            <button class="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition text-sm" id="modal-cancel">Abbrechen</button>
            <button class="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition text-sm" id="modal-confirm">${confirmText}</button>
        </div>
    `;

    modalBg.appendChild(modalContent);
    document.body.appendChild(modalBg);

    requestAnimationFrame(() => {
        modalBg.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
    });

    const closeModal = () => {
        modalBg.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => modalBg.remove(), 300);
    };

    modalContent.querySelector('#modal-cancel').addEventListener('click', closeModal);
    modalContent.querySelector('#modal-confirm').addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
}

// Leert den App-Container im HTML und fügt das passende Component ein, je nachdem wo man sich gerade befindet
export function navigate(view, data = {}) {
    localStorage.setItem('hofwaerts-route', JSON.stringify({view, data}));
    appRoot.innerHTML = '';

    let el;
    switch (view) {
        case 'start': el = document.createElement('app-start'); break;
        case 'login': el = document.createElement('app-login'); el.dataset.role = data.role; break;
        case 'placeholder': el = document.createElement('app-placeholder'); el.dataset.title = data.title; el.dataset.tab = data.tab; break;
        case 'profile': el = document.createElement('app-profile'); break;
        case 'farmer-dashboard': el = document.createElement('farmer-dashboard'); break;
        case 'farmer-products': el = document.createElement('farmer-products'); break;
        case 'add-product': el = document.createElement('add-product'); break;
        case 'edit-product': el = document.createElement('edit-product'); el.dataset.productId = data.productId; break;
        case 'customer-home': el = document.createElement('customer-home'); break;
        case 'customer-map': el = document.createElement('customer-map'); break;
        case 'farm-details': el = document.createElement('farm-details'); el.dataset.farmId = data.farmId; break;
        case 'customer-cart': el = document.createElement('customer-cart'); break;
        case 'checkout-success': el = document.createElement('checkout-success'); break;
        default: el = document.createElement('app-start');
    }
    appRoot.appendChild(el);
}