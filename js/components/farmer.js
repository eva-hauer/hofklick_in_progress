// Beinhaltet das Dashboard für Landwirte sowie alle Ansichten zur
// Produktverwaltung (Liste, Hinzufügen, Bearbeiten)

import { Component, html, on, observable } from '../../kwm-js/index.js';
import { AppState, addProductToDB, deleteProductFromDB, updateProductInDB } from '../db.js';
import { navigate, showModal, showToast } from '../router.js';

// Hochgeladene Fotos werden mithilfe eines HTML-Canvas-Element verkleinert,
// um das Firestore Limit (1MB) zu erfüllen
function compressImage(file, maxSize = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        };
    });
}

// Startseite für Landwirte
class FarmerDashboard extends Component {
    render() {
        return html`
            <div class="h-full flex flex-col pb-20 overflow-y-auto bg-brand-bg">
                <div class="relative h-64 bg-gray-200 rounded-b-[40px] overflow-hidden shadow-sm">
                    <img src="images/BauerAuer.png" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                        <p class="text-brand-beige font-medium text-sm mb-1">Willkommen zurück,</p>
                        <h1 class="text-white text-4xl font-bold">Bauer Auer!</h1>
                    </div>
                </div>
                <div class="p-8 text-center mt-6">
                    <div class="w-20 h-20 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-4 text-brand-olive">
                        <i class="material-icons-outlined text-4xl">storefront</i>
                    </div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Dein Hofladen ist online</h2>
                    <p class="text-gray-500 text-sm">Wechsle zum Reiter <b>Produkte</b> in der unteren Navigation, um dein Sortiment für die Kunden zu verwalten.</p>
                    <button ${on('click', () => navigate('farmer-products'))} class="mt-8 bg-brand-olive text-white px-8 py-3 rounded-full font-bold shadow-md transition-all">Zum Sortiment</button>
                </div>
            </div>
            <bottom-nav tab="home"></bottom-nav>
        `;
    }
}
customElements.define('farmer-dashboard', FarmerDashboard);

// Produktliste
class FarmerProducts extends Component {
    handleDelete(id) {
        // Bestätigungsfenster wird aufgerufen
        showModal("Produkt löschen", "Möchtest du dieses Produkt wirklich unwiderruflich löschen?", "Löschen", async () => {
            await deleteProductFromDB(id);
            showToast("Produkt gelöscht");
        });
    }

    render() {
        // Aktuell gibt es nur 1 Hof, darum hardcoded nach f1 filtern und alphabetisch sortieren
        // (localeCompare verwendet deutsche Sortierung)
        const myProducts = AppState.products.get()
            .filter(p => p.farmId === 'f1')
            .sort((a, b) => a.name.localeCompare(b.name));

        return html`
            <div class="h-full flex flex-col bg-brand-bg pb-24 overflow-y-auto">
                <div class="bg-white shadow-sm px-6 py-5 sticky top-0 z-40 rounded-b-[30px] mb-4">
                    <h1 class="text-2xl font-bold text-brand-olive">Meine Produkte</h1>
                    <p class="text-gray-400 text-xs mt-1">${myProducts.length} Artikel im Sortiment</p>
                </div>

                <div class="px-6 flex flex-col gap-4">
                    <button ${on('click', () => navigate('add-product'))} class="w-full bg-brand-beige text-brand-oliveDark font-bold py-4 rounded-[20px] shadow-sm flex justify-center items-center gap-2 border border-brand-olive/20">
                        <i class="material-icons">add_circle</i> Neues Produkt anlegen
                    </button>

                    ${myProducts.length === 0 ? html`<p class="text-center text-gray-400 mt-10 text-sm">Noch keine Produkte angelegt.</p>` : ''}

                    ${myProducts.map(p => html`
                        <div class="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 relative group">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg text-gray-800 pr-16">${p.name}</h3>
                                <div class="flex gap-1 bg-gray-50 rounded-full p-1 absolute right-4 top-4 border border-gray-100">
                                    <button ${on('click', () => navigate('edit-product', {productId: p.id}))} class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-brand-olive hover:bg-brand-beige transition-colors"><i class="material-icons-outlined text-[18px]">edit</i></button>
                                    <button ${on('click', () => this.handleDelete(p.id))} class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"><i class="material-icons-outlined text-[18px]">delete</i></button>
                                </div>
                            </div>
                            <div class="flex gap-4 items-center">
                                <img src="${p.img}" class="w-20 h-20 rounded-[16px] object-cover border border-gray-100 shrink-0">
                                <div class="text-sm text-gray-600 flex-grow">
                                    <p class="text-brand-olive font-extrabold text-base mb-1 bg-brand-beige/50 inline-block px-2 py-0.5 rounded-lg">${p.price.toFixed(2)} € / ${p.unit}</p>
                                    <p class="text-xs line-clamp-2 mt-1 opacity-80">${p.desc || 'Keine Beschreibung'}</p>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
            <bottom-nav tab="products"></bottom-nav>
        `;
    }
}
customElements.define('farmer-products', FarmerProducts);

// Produkt hinzufügen
class AddProduct extends Component {
    constructor() {
        super();
        this.previewBase64 = '';
    }

    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const compressedString = await compressImage(file, 800, 0.7);
            this.previewBase64 = compressedString;

            // Bild uploaden & anzeigen
            const imgEl = this.querySelector('#image-preview');
            if (imgEl) {
                imgEl.src = this.previewBase64;
                imgEl.style.display = 'block';
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.querySelector('#btn-submit');
        btn.innerHTML = `<i class="material-icons animate-spin">refresh</i> SPEICHERT...`;
        btn.disabled = true;

        await addProductToDB({
            farmId: 'f1',
            name: this.querySelector('#input-name').value,
            desc: this.querySelector('#input-desc').value,
            unit: this.querySelector('#input-unit').value,
            price: parseFloat(this.querySelector('#input-price').value),
            img: this.previewBase64 || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150&h=150&fit=crop'
        });

        showToast("Produkt erfolgreich angelegt");
        navigate('farmer-products');
    }

    render() {
        const imgVal = this.previewBase64;
        return html`
            <div class="h-full flex flex-col bg-white overflow-y-auto pb-6">
                <div class="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                    <button ${on('click', () => navigate('farmer-products'))} class="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors flex items-center justify-center text-gray-700">
                        <i class="material-icons-outlined">arrow_back</i>
                    </button>
                    <h1 class="text-xl font-bold text-brand-olive">Neues Produkt</h1>
                </div>

                <form ${on('submit', (e) => this.handleSubmit(e))} class="p-6 flex flex-col gap-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Produktname</label>
                        <input type="text" id="input-name" required placeholder="z.B. Bio-Äpfel" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Foto</label>
                        <div class="flex gap-4">
                            <input type="file" id="camera-input" accept="image/*" capture="environment" class="hidden-file-input" ${on('change', (e) => this.handleFileSelect(e))}>
                            <div ${on('click', () => this.querySelector('#camera-input').click())} class="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-brand-olive hover:text-brand-olive rounded-2xl flex flex-col justify-center items-center text-gray-400 cursor-pointer transition-colors">
                                <i class="material-icons mb-1">add_a_photo</i>
                                <span class="text-[10px] font-bold uppercase">Foto</span>
                            </div>
                            <img id="image-preview" src="${imgVal}" class="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-200" style="${imgVal ? '' : 'display: none'}">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Beschreibung</label>
                        <textarea id="input-desc" rows="3" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800"></textarea>
                    </div>

                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Preis (€)</label>
                            <input type="number" id="input-price" step="0.01" required class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Einheit</label>
                            <select id="input-unit" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800"><option>Stk.</option><option>kg</option><option>Glas</option><option>Liter</option></select>
                        </div>
                    </div>

                    <button type="submit" id="btn-submit" class="w-full bg-brand-olive text-white font-bold rounded-2xl p-4 mt-6 hover:bg-brand-oliveDark shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-2">
                        <i class="material-icons-outlined">save</i> SPEICHERN
                    </button>
                </form>
            </div>
        `;
    }
}
customElements.define('add-product', AddProduct);

// Produkt bearbeiten
class EditProduct extends Component {
    constructor() {
        super();
        this.previewBase64 = '';
        this.productId = null;
        this.productData = null;
    }

    connectedCallback() {
        // Produktdaten aus dem AppState holen, sodass Formular bereits ausgefüllt ist
        this.productId = this.dataset.productId;
        this.productData = AppState.products.get().find(p => p.id === this.productId);
        if (this.productData) {
            this.previewBase64 = this.productData.img;
        }
        super.connectedCallback();
        // Falls Produkt nicht existiert, zurücknavigieren
        if (!this.productData) navigate('farmer-products');
    }

    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const compressedString = await compressImage(file, 800, 0.7);
            this.previewBase64 = compressedString;

            const imgEl = this.querySelector('#image-preview');
            if (imgEl) {
                imgEl.src = this.previewBase64;
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.querySelector('#btn-submit');
        btn.innerHTML = `<i class="material-icons animate-spin">refresh</i> SPEICHERT...`;
        btn.disabled = true;

        await updateProductInDB(this.productId, {
            name: this.querySelector('#input-name').value,
            desc: this.querySelector('#input-desc').value,
            unit: this.querySelector('#input-unit').value,
            price: parseFloat(this.querySelector('#input-price').value),
            img: this.previewBase64
        });

        showToast("Produkt erfolgreich aktualisiert");
        navigate('farmer-products');
    }

    render() {
        if (!this.productData) return html`<div>Loading...</div>`;
        const p = this.productData;
        const imgVal = this.previewBase64;

        return html`
            <div class="h-full flex flex-col bg-white overflow-y-auto pb-6">
                <div class="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                    <button ${on('click', () => navigate('farmer-products'))} class="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors flex items-center justify-center text-gray-700">
                        <i class="material-icons-outlined">arrow_back</i>
                    </button>
                    <h1 class="text-xl font-bold text-brand-olive">Bearbeiten</h1>
                </div>

                <form ${on('submit', (e) => this.handleSubmit(e))} class="p-6 flex flex-col gap-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Produktname</label>
                        <input type="text" id="input-name" value="${p.name}" required class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Foto aktualisieren</label>
                        <div class="flex gap-4">
                            <input type="file" id="camera-input" accept="image/*" capture="environment" class="hidden-file-input" ${on('change', (e) => this.handleFileSelect(e))}>
                            <div ${on('click', () => this.querySelector('#camera-input').click())} class="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-brand-olive hover:text-brand-olive rounded-2xl flex flex-col justify-center items-center text-gray-400 cursor-pointer transition-colors">
                                <i class="material-icons mb-1">sync</i>
                                <span class="text-[10px] font-bold uppercase">Ändern</span>
                            </div>
                            <img id="image-preview" src="${imgVal}" class="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-200">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Beschreibung</label>
                        <textarea id="input-desc" rows="3" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">${p.desc || ''}</textarea>
                    </div>

                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Preis (€)</label>
                            <input type="number" id="input-price" value="${p.price}" step="0.01" required class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-400 uppercase ml-2 mb-2 tracking-wide">Einheit</label>
                            <select id="input-unit" class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-brand-olive focus:bg-white transition-all text-gray-800">
                                <option ${p.unit === 'Stk.' ? 'selected' : ''}>Stk.</option>
                                <option ${p.unit === 'kg' ? 'selected' : ''}>kg</option>
                                <option ${p.unit === 'Glas' ? 'selected' : ''}>Glas</option>
                                <option ${p.unit === 'Liter' ? 'selected' : ''}>Liter</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" id="btn-submit" class="w-full bg-brand-olive text-white font-bold rounded-2xl p-4 mt-6 hover:bg-brand-oliveDark shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-2">
                        <i class="material-icons-outlined">check_circle</i> ÄNDERUNGEN SPEICHERN
                    </button>
                </form>
            </div>
        `;
    }
}
customElements.define('edit-product', EditProduct);