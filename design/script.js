const categories = {
    decalKits: 'Kits de calcas',
    stickers: 'Calcomanías',
    designs: 'Diseños digitales',
    tools: 'Herramientas'
};

// Sample catalog: replace with real products. price: null renders "Consultar precio".
// digital: true marks downloadable files (SVG, AI, PDF) for other designers.
const products = [
    { id: 1, slug: 'kit-calcas-casco', category: 'decalKits', name: 'Kit de calcas para casco', description: 'Set de piezas recortadas listas para aplicar.', price: null },
    { id: 2, slug: 'kit-calcas-vehiculo', category: 'decalKits', name: 'Kit de calcas para vehículo', description: 'Franjas y detalles recortados para carrocería.', price: null },
    { id: 3, slug: 'calcomania-personalizada', category: 'stickers', name: 'Calcomanía de diseño personalizado', description: 'Vinil de corte para autos, paredes y vitrinas.', price: null },
    { id: 4, slug: 'pack-plantillas-calcas', category: 'designs', digital: true, name: 'Pack de plantillas para calcas', description: 'Archivos vectoriales listos para plotter, con líneas de corte y sangrado.', price: null },
    { id: 5, slug: 'mockups-vehiculo', category: 'designs', digital: true, name: 'Mockups de vehículo para portafolio', description: 'Presenta tus proyectos de vinil en carrocerías reales.', price: null },
    { id: 6, slug: 'tramas-texturas-vinil', category: 'designs', digital: true, name: 'Tramas y texturas para vinil', description: 'Patrones editables para fondos, letreros y detalles.', price: null },
    { id: 7, slug: 'raspador-aplicacion', category: 'tools', name: 'Raspador de aplicación', description: 'Raspador flexible para eliminar burbujas sin rayar el vinil.', price: null },
    { id: 8, slug: 'cutter-precision', category: 'tools', name: 'Cutter de precisión', description: 'Cuchilla de punta fina para retirar excedentes.', price: null },
    { id: 9, slug: 'pistola-calor', category: 'tools', name: 'Pistola de calor', description: 'Control de temperatura para moldear vinil en curvas.', price: null }
];

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
            location.hash = `#/producto/${product.slug}`;
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                location.hash = `#/producto/${product.slug}`;
            }
        });
        const color = categoryColors[product.category] || categoryColors.all;
        card.innerHTML = `
            <span class="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-[2rem] transition group-hover:scale-110" style="background:${tint(color, 0.14)}"></span>
            <span class="relative inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style="border-color:${color}; color:${color}; background:${tint(color, 0.1)}">${categoryIcons[product.category] || ''}<span>${categories[product.category]}</span></span>
            <h3 class="relative mt-3 text-xl font-extrabold leading-snug tracking-tight text-neutral-900">
                <span style="background:linear-gradient(transparent 60%, ${tint(color, 0.38)} 60%)">${product.name}</span>
            </h3>
            <p class="relative mt-2 text-sm text-neutral-600 flex-1">${product.description}</p>
            ${product.digital ? '<span class="relative mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-white px-2 py-0.5 text-[11px] font-semibold"><span class="h-1.5 w-1.5 rounded-full bg-[#6699FF]"></span>Descarga digital</span>' : ''}
            <div class="relative mt-6 flex items-center justify-between gap-3">
                <span class="text-base font-extrabold text-neutral-900">${product.price === null ? 'Consultar precio' : `$${product.price}`}</span>
                <button class="px-4 py-2 rounded-lg text-sm font-bold border-2 border-neutral-900 bg-[#6699FF] text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:bg-[#4d85ff] active:translate-y-0 active:shadow-none">${product.digital ? 'Comprar' : 'Cotizar'}</button>
            </div>
            <button type="button" data-add-cart="${product.slug}"
                class="relative mt-3 w-full rounded-lg border-2 border-neutral-900 bg-white px-4 py-2 text-sm font-bold text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[#E6E6E6] active:translate-y-0">
                Agregar al carrito
            </button>`;
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

function closeProduct() {
    if (!productView || productView.classList.contains('hidden')) return;
    productView.classList.add('hidden');
    productsMain.classList.remove('hidden');
    document.title = baseTitle;
    if (descriptionTag) descriptionTag.content = baseDescription;
}

function renderProduct(slug) {
    const product = products.find((item) => item.slug === slug);
    if (!product) return closeProduct();

    const color = categoryColors[product.category] || categoryColors.all;
    const priceLabel = product.price === null ? 'Consultar precio' : `$${product.price}`;

    productDetail.innerHTML = `
        <div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_2fr]">
            <div class="panel flex items-center justify-center rounded-2xl p-10" style="background:${tint(color, 0.12)}">
                <span class="[&_svg]:h-24 [&_svg]:w-24">${categoryIcons[product.category] || ''}</span>
            </div>
            <div class="panel flex flex-col rounded-2xl p-6 md:p-8">
                <span class="inline-flex w-fit items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style="border-color:${color}; color:${color}; background:${tint(color, 0.1)}">${categoryIcons[product.category] || ''}<span>${categories[product.category]}</span></span>
                <h2 class="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-3xl">
                    <span style="background:linear-gradient(transparent 60%, ${tint(color, 0.38)} 60%)">${product.name}</span>
                </h2>
                <p class="mt-3 text-neutral-600">${product.description}</p>
                ${product.digital ? '<span class="mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-white px-2 py-0.5 text-[11px] font-semibold"><span class="h-1.5 w-1.5 rounded-full bg-[#6699FF]"></span>Descarga digital</span>' : ''}
                <p class="mt-6 text-2xl font-extrabold text-neutral-900">${priceLabel}</p>
                <div class="mt-6 flex flex-wrap gap-3">
                    <button type="button" data-add-cart="${product.slug}"
                        class="rounded-lg border-2 border-neutral-900 bg-[#6699FF] px-5 py-2.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:bg-[#4d85ff] active:translate-y-0 active:shadow-none">
                        Agregar al carrito
                    </button>
                    <button id="product-whatsapp" type="button"
                        class="rounded-lg border-2 border-neutral-900 bg-[#25D366] px-5 py-2.5 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5">
                        Consultar por WhatsApp
                    </button>
                </div>
            </div>
        </div>`;

    document.getElementById('product-whatsapp').addEventListener('click', () => {
        const message = document.getElementById('wa-message');
        if (message) message.value = `Me interesa: ${product.name}`;
        const productSelect = document.getElementById('wa-product');
        if (productSelect) productSelect.value = 'otra consulta';
        document.getElementById('btn-whatsapp').click();
    });

    productsMain.classList.add('hidden');
    productView.classList.remove('hidden');
    document.title = `${product.name} | Melódico Design`;
    if (descriptionTag) descriptionTag.content = `${product.name}: ${product.description}`;
    productView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleRoute() {
    const match = location.hash.match(/^#\/producto\/(.+)$/);
    if (match) renderProduct(decodeURIComponent(match[1]));
    else closeProduct();
}

window.addEventListener('hashchange', handleRoute);

document.getElementById('product-back').addEventListener('click', () => {
    location.hash = '#products';
    if (location.hash === '#products') closeProduct();
});

handleRoute();

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

renderCatalog();

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
