const categories = {
    stickers: 'Calcomanías',
    decalKits: 'Kits de calcas',
    tools: 'Herramientas',
    designs: 'Diseños digitales'
};

// Sample catalog: replace with real products. price: null renders "Consultar precio".
// digital: true marks downloadable files (SVG, AI, PDF) for other designers.
const products = [
    { id: 1, category: 'stickers', name: 'Calcomanía de diseño personalizado', description: 'Vinil de corte para autos, paredes y vitrinas.', price: null },
    { id: 2, category: 'decalKits', name: 'Kit de calcas para casco', description: 'Set de piezas recortadas listas para aplicar.', price: null },
    { id: 3, category: 'tools', name: 'Raspador de aplicación', description: 'Raspador flexible para eliminar burbujas sin rayar el vinil.', price: null },
    { id: 4, category: 'tools', name: 'Cutter de precisión', description: 'Cuchilla de punta fina para retirar excedentes.', price: null },
    { id: 5, category: 'tools', name: 'Pistola de calor', description: 'Control de temperatura para moldear vinil en curvas.', price: null },
    { id: 6, category: 'decalKits', name: 'Kit de calcas para vehículo', description: 'Franjas y detalles recortados para carrocería.', price: null },
    { id: 7, category: 'designs', digital: true, name: 'Pack de plantillas para calcas', description: 'Archivos vectoriales listos para plotter, con líneas de corte y sangrado.', price: null },
    { id: 8, category: 'designs', digital: true, name: 'Mockups de vehículo para portafolio', description: 'Presenta tus proyectos de vinil en carrocerías reales.', price: null },
    { id: 9, category: 'designs', digital: true, name: 'Tramas y texturas para vinil', description: 'Patrones editables para fondos, letreros y detalles.', price: null }
];

const filtersElement = document.getElementById('filters');
const catalogElement = document.getElementById('catalog');

function renderFilters(activeFilter) {
    filtersElement.innerHTML = '';
    const options = { all: 'Todas', ...categories };
    Object.entries(options).forEach(([key, label]) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.className = `px-4 py-2 rounded-full text-sm font-semibold border-2 border-neutral-900 transition ${key === activeFilter
            ? 'bg-[#6699FF] text-neutral-900'
            : 'bg-white text-neutral-700 hover:bg-neutral-100'}`;
        button.addEventListener('click', () => renderCatalog(key));
        filtersElement.appendChild(button);
    });
}

function renderCatalog(filter = 'all') {
    renderFilters(filter);
    document.querySelectorAll('.nav-link').forEach(link => {
        const isActive = link.dataset.category === filter;
        link.classList.toggle('bg-white', isActive);
        link.classList.toggle('text-neutral-900', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });
    catalogElement.innerHTML = '';
    products
        .filter(product => filter === 'all' || product.category === filter)
        .forEach(product => {
            const card = document.createElement('article');
            card.className = 'panel rounded-2xl p-6 flex flex-col';
            card.innerHTML = `
                <span class="text-xs font-semibold uppercase tracking-wider text-[#3366FF]">${categories[product.category]}</span>
                <h3 class="mt-2 text-lg font-bold text-neutral-900">${product.name}</h3>
                <p class="mt-2 text-sm text-neutral-600 flex-1">${product.description}</p>
                ${product.digital ? '<span class="mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-[#E6E6E6] px-2 py-0.5 text-[11px] font-semibold">Descarga digital</span>' : ''}
                <div class="mt-6 flex items-center justify-between">
                    <span class="font-semibold text-neutral-800">${product.price === null ? 'Consultar precio' : `$${product.price}`}</span>
                    <button class="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-neutral-900 bg-[#6699FF] hover:bg-[#4d85ff] text-neutral-900">${product.digital ? 'Comprar' : 'Cotizar'}</button>
                </div>`;
            catalogElement.appendChild(card);
        });
}

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

    function readState() {
        const defaults = { index: 0, time: 0, volume: 0.8, playing: false, open: false };
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
        } catch {
            return defaults;
        }
    }

    function saveState(extra = {}) {
        savedState = {
            index: currentIndex,
            time: audio.currentTime || 0,
            volume: audio.volume,
            playing: !audio.paused,
            open: isOpen,
            ...extra,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
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

    function loadTrack(index, { startPlaying = false } = {}) {
        if (!tracks.length) return paint();
        currentIndex = (index + tracks.length) % tracks.length;
        audio.src = tracks[currentIndex].file;
        audio.load();
        if (startPlaying) play();
        paint();
        paintList();
        saveState();
    }

    function play() {
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
            if (savedState.time && savedState.time < audio.duration) {
                audio.currentTime = savedState.time;
            }
            paint();
        }, { once: true });
    }

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
    ui.next.addEventListener('click', () => loadTrack(currentIndex + 1, { startPlaying: true }));
    ui.listButton.addEventListener('click', () => toggleList());
    ui.seek.addEventListener('input', () => {
        audio.currentTime = Number(ui.seek.value);
    });

    audio.addEventListener('play', () => { paint(); saveState(); });
    audio.addEventListener('pause', () => { paint(); saveState(); });
    audio.addEventListener('ended', () => loadTrack(currentIndex + 1, { startPlaying: true }));
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
