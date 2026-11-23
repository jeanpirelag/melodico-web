const categories = {
    decalKits: 'Kits de calcas',
    stickers: 'Calcomanías',
    designs: 'Diseños digitales',
    tools: 'Herramientas'
};

// Sample catalog: replace with real products. price: null renders "Consultar precio".
// digital: true marks downloadable files (SVG, AI, PDF) for other designers.
// Fallback catalog used when the API is unreachable. The real catalog lives in the database
// and is managed from /design/panel.
const fallbackProducts = [
    { id: 1, code: 'MD-0001', slug: 'kit-calcas-casco', category: 'decalKits', name: 'Kit de calcas para casco', description: 'Set de piezas recortadas listas para aplicar.', price: null },
    { id: 2, code: 'MD-0002', slug: 'kit-calcas-vehiculo', category: 'decalKits', name: 'Kit de calcas para vehículo', description: 'Franjas y detalles recortados para carrocería.', price: null },
    { id: 3, code: 'MD-0003', slug: 'calcomania-personalizada', category: 'stickers', name: 'Calcomanía de diseño personalizado', description: 'Vinil de corte para autos, paredes y vitrinas.', price: null },
    { id: 4, code: 'MD-0004', slug: 'pack-plantillas-calcas', category: 'designs', digital: true, name: 'Pack de plantillas para calcas', description: 'Archivos vectoriales listos para plotter, con líneas de corte y sangrado.', price: null },
    { id: 5, code: 'MD-0005', slug: 'mockups-vehiculo', category: 'designs', digital: true, name: 'Mockups de vehículo para portafolio', description: 'Presenta tus proyectos de vinil en carrocerías reales.', price: null },
    { id: 6, code: 'MD-0006', slug: 'tramas-texturas-vinil', category: 'designs', digital: true, name: 'Tramas y texturas para vinil', description: 'Patrones editables para fondos, letreros y detalles.', price: null },
    { id: 7, code: 'MD-0007', slug: 'raspador-aplicacion', category: 'tools', name: 'Raspador de aplicación', description: 'Raspador flexible para eliminar burbujas sin rayar el vinil.', price: null },
    { id: 8, code: 'MD-0008', slug: 'cutter-precision', category: 'tools', name: 'Cutter de precisión', description: 'Cuchilla de punta fina para retirar excedentes.', price: null },
    { id: 9, code: 'MD-0009', slug: 'pistola-calor', category: 'tools', name: 'Pistola de calor', description: 'Control de temperatura para moldear vinil en curvas.', price: null }
];

let products = fallbackProducts;

const apiOverride = document.querySelector('meta[name="melodico-api"]')?.content?.trim();
const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const LOCAL_API = 'http://localhost:3000/api';

// Same origin by default: the server that serves /design also serves /api.
// Only files opened directly or a cross-origin deployment need a different base.
let API_BASE = location.protocol === 'file:'
    ? LOCAL_API
    : isLocalHost
        ? '/api'
        : (apiOverride || '/api');
window.MELODICO_API_BASE = API_BASE;

async function resolveApiBase() {
    try {
        const response = await fetch(`${API_BASE}/shop/products`);
        if (response.ok) return;
    } catch {
        /* try the fallback below */
    }
    // Static preview servers (Live Server, etc.) do not expose the API: use the local server
    if (isLocalHost && API_BASE !== LOCAL_API) {
        API_BASE = LOCAL_API;
        window.MELODICO_API_BASE = API_BASE;
    }
}

async function loadProducts() {
    await resolveApiBase();
    try {
        const response = await fetch(`${API_BASE}/shop/products`);
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.products) && data.products.length) {
            products = data.products;
            window.MELODICO_PRODUCTS = products;
        }
    } catch {
        /* offline: keep the fallback catalog */
    }
}

// The shop module (shop.js) needs the catalog to build cart items.
window.MELODICO_PRODUCTS = products;

const categoryColors = {
    all: '#111111',
    decalKits: '#3b82f6',
    stickers: '#ec4899',
    designs: '#8b5cf6',
    tools: '#f59e0b'
};

const buildIcon = (path, color) => `<svg class="h-4 w-4 shrink-0" style="color:${color}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

const tint = (hex, alpha = 0.12) => {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const categoryIcons = {
    all: buildIcon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', categoryColors.all),
    decalKits: buildIcon('<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>', categoryColors.decalKits),
    stickers: buildIcon('<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>', categoryColors.stickers),
    designs: buildIcon('<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>', categoryColors.designs),
    tools: buildIcon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', categoryColors.tools)
};

const filtersElement = document.getElementById('filters');
const catalogElement = document.getElementById('catalog');
const searchInput = document.getElementById('search');
const noResultsElement = document.getElementById('no-results');

let activeFilter = 'all';

const normalize = (text) => text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function renderFilters(active) {
    filtersElement.innerHTML = '';
    const options = { all: 'Todas', ...categories };
    Object.entries(options).forEach(([key, label]) => {
        const button = document.createElement('button');
        const color = categoryColors[key] || categoryColors.all;
        const isActive = key === activeFilter;
        button.innerHTML = `${categoryIcons[key] || ''}<span>${label}</span>`;
        button.className = `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition duration-200 ${isActive
            ? '-translate-y-0.5 shadow-[3px_3px_0_#111]'
            : 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#111]'}`;
        button.style.borderColor = color;
        button.style.color = isActive ? '#ffffff' : color;
        button.style.backgroundColor = isActive ? color : tint(color, 0.1);
        const icon = button.querySelector('svg');
        if (icon) icon.style.color = isActive ? '#ffffff' : color;
        button.addEventListener('click', () => renderCatalog(key));
        filtersElement.appendChild(button);
    });
}

function renderCatalog(filter = activeFilter) {
    activeFilter = filter;
    renderFilters(activeFilter);
    document.querySelectorAll('.nav-link').forEach(link => {
        const isActive = link.dataset.category === activeFilter;
        link.classList.toggle('bg-white', isActive);
        link.classList.toggle('text-neutral-900', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });

    const query = normalize(searchInput.value || '');
    const matches = products.filter(product => {
        const inCategory = activeFilter === 'all' || product.category === activeFilter;
        const haystack = normalize(`${product.name} ${product.description} ${categories[product.category]}`);
        return inCategory && (!query || haystack.includes(query));
    });

    catalogElement.innerHTML = '';
    noResultsElement.classList.toggle('hidden', matches.length > 0);

    matches.forEach(product => {
        const card = document.createElement('article');
        card.className = 'panel group relative cursor-pointer rounded-2xl p-6 flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_#111]';
        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', `Ver ${product.name}`);
        card.addEventListener('click', (event) => {
            if (event.target.closest('button')) return;
            location.hash = `#/${productPath(product)}`;
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                location.hash = `#/${productPath(product)}`;
            }
        });
        const color = categoryColors[product.category] || categoryColors.all;
        card.innerHTML = `
            <span class="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-[2rem] transition group-hover:scale-110" style="background:${tint(color, 0.14)}"></span>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="relative mb-3 h-40 w-full rounded-xl border-2 border-neutral-900 object-cover">` : ''}
            <span class="relative inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style="border-color:${color}; color:${color}; background:${tint(color, 0.1)}">${categoryIcons[product.category] || ''}<span>${categories[product.category]}</span></span>
            <h3 class="relative mt-3 text-xl font-extrabold leading-snug tracking-tight text-neutral-900">${product.name}</h3>
            <p class="relative mt-2 text-sm text-neutral-600 flex-1">${product.description}</p>
            ${product.digital ? '<span class="relative mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-white px-2 py-0.5 text-[11px] font-semibold"><span class="h-1.5 w-1.5 rounded-full bg-[#6699FF]"></span>Descarga digital</span>' : ''}
            <div class="relative mt-6 flex items-center justify-between gap-3">
                <span class="text-base font-extrabold text-neutral-900">${product.price === null ? 'Consultar precio' : `$${product.price}`}</span>
                ${product.price === null
                    ? `<button type="button" data-quote="${product.slug}"
                        class="inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-[#25D366] px-4 py-2 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-none">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.26 4.86L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-3.24-.68-2.73-1.08-4.45-3.9-4.59-4.08-.13-.18-1.09-1.45-1.09-2.77 0-1.32.7-1.97.94-2.24.25-.27.54-.34.72-.34l.52.01c.17 0 .39-.06.61.47l.83 2.02c.07.14.11.31 0 .5-.1.18-.16.3-.32.46l-.48.5c-.16.16-.32.34-.14.66.18.32.8 1.32 1.72 2.14 1.18 1.05 1.74 1.24 2.06 1.4.32.15.5.13.68-.08l.98-1.14c.23-.27.42-.2.7-.1l1.99.94c.29.14.48.2.55.32.07.11.07.68-.17 1.36z"/></svg>
                        Cotizar
                    </button>`
                    : `<button type="button" data-buy="${product.slug}"
                        class="inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-[#6699FF] px-4 py-2 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:bg-[#4d85ff] active:translate-y-0 active:shadow-none">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"/></svg>
                        Comprar
                    </button>`}
            </div>
            <div class="relative mt-3 flex gap-2">
                ${product.price !== null
                    ? `<button type="button" data-quote="${product.slug}"
                        class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-[#25D366] px-3 py-2 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105">
                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.26 4.86L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-3.24-.68-2.73-1.08-4.45-3.9-4.59-4.08-.13-.18-1.09-1.45-1.09-2.77 0-1.32.7-1.97.94-2.24.25-.27.54-.34.72-.34l.52.01c.17 0 .39-.06.61.47l.83 2.02c.07.14.11.31 0 .5-.1.18-.16.3-.32.46l-.48.5c-.16.16-.32.34-.14.66.18.32.8 1.32 1.72 2.14 1.18 1.05 1.74 1.24 2.06 1.4.32.15.5.13.68-.08l.98-1.14c.23-.27.42-.2.7-.1l1.99.94c.29.14.48.2.55.32.07.11.07.68-.17 1.36z"/></svg>
                        Cotizar
                    </button>`
                    : ''}
                <button type="button" data-add-cart="${product.slug}"
                    class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-white px-3 py-2 text-xs font-bold text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[#E6E6E6] active:translate-y-0">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                    Agregar
                </button>
            </div>`;
        catalogElement.appendChild(card);
    });
}

searchInput.addEventListener('input', () => renderCatalog(activeFilter));

/* ---------- Product page ---------- */
const productView = document.getElementById('product-view');
const productDetail = document.getElementById('product-detail');
const productsMain = document.getElementById('products');
const baseTitle = document.title;
const descriptionTag = document.querySelector('meta[name="description"]');
const baseDescription = descriptionTag?.content || '';

const categorySlugs = {
    decalKits: 'kits-de-calcas',
    stickers: 'calcomanias',
    designs: 'disenos-digitales',
    tools: 'herramientas'
};

const slugToCategory = Object.fromEntries(Object.entries(categorySlugs).map(([key, slug]) => [slug, key]));

function productPath(product) {
    return `${categorySlugs[product.category] || 'productos'}/${product.code || product.slug}`;
}

function closeProduct() {
    if (!productView || productView.classList.contains('hidden')) return;
    productView.classList.add('hidden');
    productsMain.classList.remove('hidden');
    document.title = baseTitle;
    if (descriptionTag) descriptionTag.content = baseDescription;

    // Leave the product URL behind: otherwise clicking the same product again would not fire hashchange
    if (location.hash.startsWith('#/')) {
        history.replaceState(null, '', `${location.pathname}${location.search}#products`);
    }
}

function renderProduct(code, category = null) {
    const key = String(code).toUpperCase();
    const product = products.find((item) => (!category || item.category === category) && (item.code || '').toUpperCase() === key)
        || products.find((item) => (!category || item.category === category) && item.slug === code);
    if (!product) return closeProduct();

    const color = categoryColors[product.category] || categoryColors.all;
    const priceLabel = product.price === null ? 'Consultar precio' : `$${product.price}`;

    productDetail.innerHTML = `
        <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_2fr]">
            <div class="panel flex flex-col gap-2 rounded-2xl p-4" style="background:${tint(color, 0.12)}">
                ${product.image
                    ? `<img id="product-main-image" src="${product.image}" alt="${product.name}" class="w-full rounded-xl border-2 border-neutral-900 object-cover">
                       ${(product.images?.length || 0) > 1
                            ? `<div class="flex gap-2 overflow-x-auto pb-1">${product.images.map((image) => `
                                <button type="button" data-gallery-src="${image.image}" aria-label="Ver imagen"
                                    class="shrink-0 overflow-hidden rounded-lg border-2 border-neutral-900 ${image.image === product.image ? 'ring-2 ring-[#6699FF]' : ''}">
                                    <img src="${image.image}" alt="" class="h-14 w-14 object-cover">
                                </button>`).join('')}</div>`
                            : ''}`
                    : `<div class="flex items-center justify-center py-8"><span class="[&_svg]:h-24 [&_svg]:w-24">${categoryIcons[product.category] || ''}</span></div>`}
            </div>
            <div class="panel flex flex-col rounded-2xl p-6 md:p-8">
                <span class="inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style="border-color:${color}; color:${color}; background:${tint(color, 0.1)}">${categoryIcons[product.category] || ''}<span>${categories[product.category]}</span></span>
                <h2 class="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-3xl">${product.name}</h2>
                <p class="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <button type="button" data-category-link class="hover:text-neutral-900 hover:underline">${categories[product.category]}</button>
                    <span aria-hidden="true">/</span>
                    <span class="font-mono uppercase tracking-wider">${product.code || product.slug}</span>
                </p>
                <p class="mt-3 text-neutral-600">${product.description}</p>
                ${product.digital ? '<span class="mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-white px-2 py-0.5 text-[11px] font-semibold"><span class="h-1.5 w-1.5 rounded-full bg-[#6699FF]"></span>Descarga digital</span>' : ''}
                <p class="mt-6 text-2xl font-extrabold text-neutral-900">${priceLabel}</p>
                <div class="mt-6 flex flex-wrap gap-3">
                    ${product.price !== null
                        ? `<button type="button" data-buy="${product.slug}"
                            class="inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-[#6699FF] px-5 py-2.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:bg-[#4d85ff]">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"/></svg>
                            Comprar
                        </button>`
                        : ''}
                    <button type="button" data-quote="${product.slug}"
                        class="inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-[#25D366] px-5 py-2.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:brightness-105">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.42 1.26 4.86L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-3.24-.68-2.73-1.08-4.45-3.9-4.59-4.08-.13-.18-1.09-1.45-1.09-2.77 0-1.32.7-1.97.94-2.24.25-.27.54-.34.72-.34l.52.01c.17 0 .39-.06.61.47l.83 2.02c.07.14.11.31 0 .5-.1.18-.16.3-.32.46l-.48.5c-.16.16-.32.34-.14.66.18.32.8 1.32 1.72 2.14 1.18 1.05 1.74 1.24 2.06 1.4.32.15.5.13.68-.08l.98-1.14c.23-.27.42-.2.7-.1l1.99.94c.29.14.48.2.55.32.07.11.07.68-.17 1.36z"/></svg>
                        Cotizar
                    </button>
                    <button type="button" data-add-cart="${product.slug}"
                        class="inline-flex items-center gap-1.5 rounded-lg border-2 border-neutral-900 bg-white px-5 py-2.5 text-sm font-bold text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[#E6E6E6]">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>`;

    productDetail.querySelector('[data-category-link]')?.addEventListener('click', () => {
        location.hash = '#products';
        closeProduct();
        renderCatalog(product.category);
        productsMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const mainImage = document.getElementById('product-main-image');
    if (mainImage) {
        productDetail.querySelectorAll('[data-gallery-src]').forEach((thumb) => {
            thumb.addEventListener('click', () => {
                mainImage.src = thumb.dataset.gallerySrc;
                productDetail.querySelectorAll('[data-gallery-src]').forEach((other) => {
                    other.classList.toggle('ring-2', other === thumb);
                    other.classList.toggle('ring-[#6699FF]', other === thumb);
                });
            });
        });
    }

    productsMain.classList.add('hidden');
    productView.classList.remove('hidden');
    document.title = `${product.name} | Melódico Design`;
    if (descriptionTag) descriptionTag.content = `${product.name}: ${product.description}`;
    productView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleRoute() {
    const legacy = location.hash.match(/^#\/producto\/(.+)$/);
    if (legacy) return renderProduct(decodeURIComponent(legacy[1]));

    const match = location.hash.match(/^#\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)$/);
    if (match) {
        const category = slugToCategory[match[1]];
        if (category) return renderProduct(match[2], category);
    }

    closeProduct();
}

window.addEventListener('hashchange', handleRoute);

document.addEventListener('click', (event) => {
    const quote = event.target.closest('[data-quote]');
    if (!quote) return;

    const product = products.find((item) => item.slug === quote.dataset.quote);
    if (!product) return;

    const quoteCategories = {
        decalKits: 'un kit de calcas',
        stickers: 'una calcomanía',
        designs: 'un diseño digital',
        tools: 'herramientas de instalación'
    };

    const message = document.getElementById('wa-message');
    if (message) {
        message.value = `Me interesa cotizar: ${product.name}${product.code ? ` (${product.code})` : ''}`;
    }
    const productSelect = document.getElementById('wa-product');
    if (productSelect) productSelect.value = quoteCategories[product.category] || 'otra consulta';
    document.getElementById('btn-whatsapp').click();
});

document.getElementById('product-back').addEventListener('click', () => {
    location.hash = '#products';
    if (location.hash === '#products') closeProduct();
});

/* ---------- Navigation ---------- */
const menuButton = document.getElementById('btn-menu');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu() {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', isOpen);
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
}

menuButton.addEventListener('click', toggleMenu);

document.querySelectorAll('[data-category]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        closeProduct();
        renderCatalog(link.dataset.category);
        document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!mobileMenu.classList.contains('hidden')) toggleMenu();
    });
});

document.querySelectorAll('[data-open-whatsapp]').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('btn-whatsapp').click();
        if (!mobileMenu.classList.contains('hidden')) toggleMenu();
    });
});

document.querySelectorAll('.nav-link').forEach(link => {
    const icon = categoryIcons[link.dataset.category] || '';
    const label = link.textContent.trim();
    if (link.classList.contains('justify-between')) {
        link.innerHTML = `<span class="flex items-center gap-2">${icon}<span>${label}</span></span><span class="text-neutral-400">→</span>`;
    } else {
        link.classList.add('inline-flex', 'items-center', 'gap-1.5');
        link.innerHTML = `${icon}<span>${label}</span>`;
    }
});

(async () => {
    await loadProducts();
    renderCatalog();
    handleRoute();
})();

/* ---------- Music player ---------- */
// Add your MP3 files to assets/audio/ and declare each track here.
// Only use audio you have the right to publish (your own tracks or licensed music).
const tracks = [
    { title: 'Afro Is This Love', artist: 'Bob Marley · Dj Adrián Maniático', file: '../assets/audio/afro-is-this-love.mp3' },
    { title: 'Toco El Cielo', artist: 'Manco The Sound [Prod. Yilberking]', file: '../assets/audio/toco-el-cielo.mp3' },
    { title: 'Bailar Contigo (Remix)', artist: 'Monsieur Periné & LEEB', file: '../assets/audio/bailar-contigo-remix.mp3' },
    { title: 'Enséñame a Soñar', artist: 'DJ Goozo x Massianello x Susan Díaz', file: '../assets/audio/ensename-a-sonar.mp3' },
    { title: 'Me Provocas', artist: 'Fumaratto', file: '../assets/audio/me-provocas.mp3' },
    { title: 'Devuélvete (Natz Remix)', artist: 'Carla Morrison', file: '../assets/audio/devuelvete-natz-remix.mp3' }
];

const music = (() => {
    const STORAGE_KEY = 'melodico-player';
    const trigger = document.getElementById('btn-music');
    const panel = document.getElementById('music-panel');
    const audio = new Audio();
    audio.preload = 'metadata';

    const ui = {
        title: document.getElementById('track-title'),
        artist: document.getElementById('track-artist'),
        play: document.getElementById('btn-play'),
        next: document.getElementById('btn-next'),
        seek: document.getElementById('seek'),
        list: document.getElementById('music-list'),
        listButton: document.getElementById('btn-list'),
    };

    const PLAY_ICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    const PAUSE_ICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

    let currentIndex = 0;
    let isOpen = false;
    let lastSaved = 0;
    let savedState = readState();
    let pendingTime = savedState.time || 0;
    let positionRestored = false;

    function readState() {
        const defaults = { index: 0, time: 0, volume: 0.8, playing: false, open: false };
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
        } catch {
            return defaults;
        }
    }

    function saveState(extra = {}) {
        // Never overwrite the saved position before it has been restored.
        const time = positionRestored ? (audio.currentTime || 0) : pendingTime;
        savedState = {
            index: currentIndex,
            time,
            volume: audio.volume,
            playing: !audio.paused,
            open: isOpen,
            ...extra,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    }

    function restorePosition() {
        if (positionRestored) return;
        if (pendingTime) {
            if (!audio.duration) return; // wait until duration is known
            audio.currentTime = Math.min(pendingTime, Math.max(audio.duration - 1, 0));
            ui.seek.value = audio.currentTime;
        }
        positionRestored = true;
    }

    function paintList() {
        ui.list.innerHTML = '';
        if (!tracks.length) {
            const empty = document.createElement('p');
            empty.className = 'px-3 py-2 text-[10px] leading-snug text-neutral-500';
            empty.textContent = 'Añade tus MP3 en assets/audio/ y decláralos en tracks.';
            ui.list.appendChild(empty);
            return;
        }
        tracks.forEach((track, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `flex w-full items-center gap-2 border-b-2 border-neutral-900 px-2.5 py-2 text-left last:border-b-0 ${index === currentIndex ? 'bg-[#6699FF]' : 'bg-white hover:bg-neutral-100'}`;
            item.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
            item.innerHTML = `<span class="w-4 shrink-0 text-[10px] font-bold text-neutral-700">${index === currentIndex ? '▶' : index + 1}</span>
                <span class="min-w-0">
                    <span class="block truncate text-[11px] font-bold text-neutral-900">${track.title}</span>
                    <span class="block truncate text-[10px] text-neutral-600">${track.artist}</span>
                </span>`;
            item.addEventListener('click', () => {
                loadTrack(index, { startPlaying: true });
                toggleList(false);
            });
            ui.list.appendChild(item);
        });
    }

    function toggleList(force) {
        const shouldOpen = typeof force === 'boolean' ? force : ui.list.classList.contains('hidden');
        ui.list.classList.toggle('hidden', !shouldOpen);
        ui.listButton.setAttribute('aria-expanded', String(shouldOpen));
    }

    function paint() {
        const track = tracks[currentIndex];
        ui.title.textContent = track ? track.title : 'Sin pistas';
        ui.artist.textContent = track ? track.artist : '—';
        ui.play.innerHTML = audio.paused ? PLAY_ICON : PAUSE_ICON;
        ui.play.setAttribute('aria-label', audio.paused ? 'Reproducir' : 'Pausar');
        const isEmpty = tracks.length === 0;
        [ui.play, ui.next, ui.seek].forEach(element => element.disabled = isEmpty);
        if (audio.duration) {
            ui.seek.max = audio.duration;
            ui.seek.value = audio.currentTime;
        }
    }

    function randomIndex() {
        if (tracks.length < 2) return 0;
        let index;
        do {
            index = Math.floor(Math.random() * tracks.length);
        } while (index === currentIndex);
        return index;
    }

    function loadTrack(index, { startPlaying = false } = {}) {
        if (!tracks.length) return paint();
        currentIndex = (index + tracks.length) % tracks.length;
        pendingTime = 0;
        positionRestored = true;
        audio.src = tracks[currentIndex].file;
        audio.load();
        if (startPlaying) play();
        paint();
        paintList();
        saveState();
    }

    function play() {
        restorePosition();
        audio.play().catch(() => paint());
    }

    function togglePlayback() {
        audio.paused ? play() : audio.pause();
    }

    function show() {
        panel.classList.remove('hidden');
        trigger.classList.add('hidden');
        isOpen = true;
        trigger.setAttribute('aria-expanded', 'true');
        paint();
        saveState();
    }

    function hide() {
        panel.classList.add('hidden');
        trigger.classList.remove('hidden');
        isOpen = false;
        trigger.setAttribute('aria-expanded', 'false');
        saveState();
    }

    /* --- restore previous session --- */
    audio.volume = savedState.volume;

    if (tracks.length) {
        currentIndex = Math.min(savedState.index || 0, tracks.length - 1);
        audio.src = tracks[currentIndex].file;
        audio.addEventListener('loadedmetadata', () => {
            restorePosition();
            paint();
        }, { once: true });
        audio.addEventListener('canplay', () => {
            restorePosition();
        }, { once: true });
    }

    // Persist the exact position when leaving or hiding the page.
    window.addEventListener('beforeunload', () => saveState());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveState();
    });

    // Browsers only allow audio after a user gesture: resume on the first one.
    if (savedState.playing && tracks.length) {
        play(); // immediate attempt (may be blocked by the autoplay policy)
        const resume = () => {
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
            if (audio.paused) play();
        };
        window.addEventListener('pointerdown', resume);
        window.addEventListener('keydown', resume);
    }

    if (savedState.open) show();

    /* --- events --- */
    trigger.addEventListener('click', () => {
        if (isOpen) {
            hide();
            return;
        }
        show();
        play();
    });

    document.getElementById('btn-close-music').addEventListener('click', hide);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen) hide();
    });

    ui.play.addEventListener('click', togglePlayback);
    ui.next.addEventListener('click', () => loadTrack(randomIndex(), { startPlaying: true }));
    ui.listButton.addEventListener('click', () => toggleList());
    ui.seek.addEventListener('input', () => {
        audio.currentTime = Number(ui.seek.value);
    });

    audio.addEventListener('play', () => { paint(); saveState(); });
    audio.addEventListener('pause', () => { paint(); saveState(); });
    audio.addEventListener('ended', () => loadTrack(randomIndex(), { startPlaying: true }));
    audio.addEventListener('error', () => {
        ui.artist.textContent = 'No se pudo cargar el audio';
    });
    audio.addEventListener('timeupdate', () => {
        ui.seek.value = audio.currentTime;
        if (Date.now() - lastSaved > 2000) {
            lastSaved = Date.now();
            saveState();
        }
    });

    paint();
    paintList();

    return { show, hide };
})();

/* ---------- Click blip ---------- */
let blipContext;
function playBlip() {
    try {
        blipContext = blipContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = blipContext.createOscillator();
        const gain = blipContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, blipContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, blipContext.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, blipContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, blipContext.currentTime + 0.12);
        oscillator.connect(gain).connect(blipContext.destination);
        oscillator.start();
        oscillator.stop(blipContext.currentTime + 0.13);
    } catch { /* the browser does not allow audio */ }
}

document.addEventListener('click', (event) => {
    if (event.target.closest('button')) playBlip();
});

/* ---------- WhatsApp contact ---------- */
(() => {
    const PHONE = '584246441382';
    const modal = document.getElementById('whatsapp-modal');
    const openButton = document.getElementById('btn-whatsapp');
    const closeButton = document.getElementById('btn-close-whatsapp');
    const form = document.getElementById('whatsapp-form');
    let lastFocused = null;

    function show() {
        lastFocused = document.activeElement;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        document.getElementById('wa-name').focus();
    }

    function hide() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    openButton.addEventListener('click', show);
    closeButton.addEventListener('click', hide);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) hide();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) hide();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('wa-name').value.trim();
        const product = document.getElementById('wa-product').value;
        const details = document.getElementById('wa-message').value.trim();

        let message = `¡Hola Melódico Design! Soy ${name} y necesito ayuda con ${product}.`;
        if (details) message += `\n\n${details}`;
        message += '\n\n¿Me pueden orientar con la compra?';

        window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
        hide();
    });
})();
