const categorias = {
    calcomanias: 'Calcomanías',
    kits: 'Kits de calcas',
    herramientas: 'Herramientas',
    disenos: 'Diseños digitales'
};

// Catálogo de ejemplo: reemplazar con productos reales. price: null muestra "Consultar precio".
// digital: true marca los archivos descargables (SVG, AI, PDF) para otros diseñadores.
const productos = [
    { id: 1, categoria: 'calcomanias', nombre: 'Calcomanía de diseño personalizado', descripcion: 'Vinil de corte para autos, paredes y vitrinas.', price: null },
    { id: 2, categoria: 'kits', nombre: 'Kit de calcas para casco', descripcion: 'Set de piezas recortadas listas para aplicar.', price: null },
    { id: 3, categoria: 'herramientas', nombre: 'Raspador de aplicación', descripcion: 'Raspador flexible para eliminar burbujas sin rayar el vinil.', price: null },
    { id: 4, categoria: 'herramientas', nombre: 'Cutter de precisión', descripcion: 'Cuchilla de punta fina para retirar excedentes.', price: null },
    { id: 5, categoria: 'herramientas', nombre: 'Pistola de calor', descripcion: 'Control de temperatura para moldear vinil en curvas.', price: null },
    { id: 6, categoria: 'kits', nombre: 'Kit de calcas para vehículo', descripcion: 'Franjas y detalles recortados para carrocería.', price: null },
    { id: 7, categoria: 'disenos', digital: true, nombre: 'Pack de plantillas para calcas', descripcion: 'Archivos vectoriales listos para plotter, con líneas de corte y sangrado.', price: null },
    { id: 8, categoria: 'disenos', digital: true, nombre: 'Mockups de vehículo para portafolio', descripcion: 'Presenta tus proyectos de vinil en carrocerías reales.', price: null },
    { id: 9, categoria: 'disenos', digital: true, nombre: 'Tramas y texturas para vinil', descripcion: 'Patrones editables para fondos, letreros y detalles.', price: null }
];

const filtros = document.getElementById('filtros');
const catalogo = document.getElementById('catalogo');

function renderFiltros(activa) {
    filtros.innerHTML = '';
    const opciones = { todas: 'Todas', ...categorias };
    Object.entries(opciones).forEach(([clave, etiqueta]) => {
        const boton = document.createElement('button');
        boton.textContent = etiqueta;
        boton.className = `px-4 py-2 rounded-full text-sm font-semibold border-2 border-neutral-900 transition ${clave === activa
            ? 'bg-[#6699FF] text-neutral-900'
            : 'bg-white text-neutral-700 hover:bg-neutral-100'}`;
        boton.addEventListener('click', () => renderCatalogo(clave));
        filtros.appendChild(boton);
    });
}

function renderCatalogo(filtro = 'todas') {
    renderFiltros(filtro);
    document.querySelectorAll('.nav-link').forEach(el => {
        const activo = el.dataset.categoria === filtro;
        el.classList.toggle('bg-white', activo);
        el.classList.toggle('text-neutral-900', activo);
        if (activo) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
    });
    catalogo.innerHTML = '';
    productos
        .filter(p => filtro === 'todas' || p.categoria === filtro)
        .forEach(p => {
            const card = document.createElement('article');
            card.className = 'panel rounded-2xl p-6 flex flex-col';
            card.innerHTML = `
                <span class="text-xs font-semibold uppercase tracking-wider text-[#3366FF]">${categorias[p.categoria]}</span>
                <h3 class="mt-2 text-lg font-bold text-neutral-900">${p.nombre}</h3>
                <p class="mt-2 text-sm text-neutral-600 flex-1">${p.descripcion}</p>
                ${p.digital ? '<span class="mt-3 inline-flex w-fit items-center gap-1 rounded-full border-2 border-neutral-900 bg-[#E6E6E6] px-2 py-0.5 text-[11px] font-semibold">Descarga digital</span>' : ''}
                <div class="mt-6 flex items-center justify-between">
                    <span class="font-semibold text-neutral-800">${p.price === null ? 'Consultar precio' : `$${p.price}`}</span>
                    <button class="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-neutral-900 bg-[#6699FF] hover:bg-[#4d85ff] text-neutral-900">${p.digital ? 'Comprar' : 'Cotizar'}</button>
                </div>`;
            catalogo.appendChild(card);
        });
}

const btnMenu = document.getElementById('btn-menu');
const menuMovil = document.getElementById('menu-movil');

function alternarMenu() {
    const abierto = !menuMovil.classList.contains('hidden');
    menuMovil.classList.toggle('hidden', abierto);
    btnMenu.setAttribute('aria-expanded', String(!abierto));
    btnMenu.setAttribute('aria-label', abierto ? 'Abrir menú' : 'Cerrar menú');
}

btnMenu.addEventListener('click', alternarMenu);

document.querySelectorAll('[data-categoria]').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
        e.preventDefault();
        renderCatalogo(enlace.dataset.categoria);
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!menuMovil.classList.contains('hidden')) alternarMenu();
    });
});

document.querySelectorAll('[data-abrir-whatsapp]').forEach(boton => {
    boton.addEventListener('click', () => {
        document.getElementById('btn-whatsapp').click();
        if (!menuMovil.classList.contains('hidden')) alternarMenu();
    });
});

renderCatalogo();

/* ---------- Reproductor propio ---------- */
// Añade tus MP3 en assets/audio/ y declara cada pista aquí.
// Solo usa audio que tengas derecho a publicar (tus temas o música con licencia).
const PISTAS = [
    { titulo: 'Afro Is This Love', artista: 'Bob Marley · Dj Adrián Maniático', archivo: '../assets/audio/afro-is-this-love.mp3' },
    { titulo: 'Toco El Cielo', artista: 'Manco The Sound [Prod. Yilberking]', archivo: '../assets/audio/toco-el-cielo.mp3' },
    { titulo: 'Bailar Contigo (Remix)', artista: 'Monsieur Periné & LEEB', archivo: '../assets/audio/bailar-contigo-remix.mp3' },
    { titulo: 'Enséñame a Soñar', artista: 'DJ Goozo x Massianello x Susan Díaz', archivo: '../assets/audio/ensename-a-sonar.mp3' },
    { titulo: 'Me Provocas', artista: 'Fumaratto', archivo: '../assets/audio/me-provocas.mp3' },
    { titulo: 'Devuélvete (Guaracha)', artista: '—', archivo: '../assets/audio/devuelvete-guaracha.mp3' },
];

const musica = (() => {
    const CLAVE = 'melodico-reproductor';
    const boton = document.getElementById('btn-musica');
    const panel = document.getElementById('panel-musica');
    const audio = new Audio();
    audio.preload = 'metadata';

    const ui = {
        titulo: document.getElementById('m-titulo'),
        artista: document.getElementById('m-artista'),
        play: document.getElementById('m-play'),
        next: document.getElementById('m-next'),
        seek: document.getElementById('m-seek'),
        lista: document.getElementById('lista-musica'),
        listaBtn: document.getElementById('m-lista-btn'),
    };

    const ICONO_PLAY = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    const ICONO_PAUSA = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

    let indice = 0;
    let abierto = false;
    let ultimoGuardado = 0;
    let guardado = leer();

    function leer() {
        try {
            return { indice: 0, tiempo: 0, volumen: 0.8, reproduciendo: false, abierto: false, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') };
        } catch {
            return { indice: 0, tiempo: 0, volumen: 0.8, reproduciendo: false, abierto: false };
        }
    }

    function guardar(extra = {}) {
        guardado = {
            indice,
            tiempo: audio.currentTime || 0,
            volumen: audio.volume,
            reproduciendo: !audio.paused,
            abierto,
            ...extra,
        };
        localStorage.setItem(CLAVE, JSON.stringify(guardado));
    }

    function pintarLista() {
        ui.lista.innerHTML = '';
        if (!PISTAS.length) {
            const vacio = document.createElement('p');
            vacio.className = 'px-3 py-2 text-[10px] leading-snug text-neutral-500';
            vacio.textContent = 'Añade tus MP3 en assets/audio/ y decláralos en PISTAS.';
            ui.lista.appendChild(vacio);
            return;
        }
        PISTAS.forEach((pista, i) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `flex w-full items-center gap-2 border-b-2 border-neutral-900 px-2.5 py-2 text-left last:border-b-0 ${i === indice ? 'bg-[#6699FF]' : 'bg-white hover:bg-neutral-100'}`;
            item.setAttribute('aria-current', i === indice ? 'true' : 'false');
            item.innerHTML = `<span class="w-4 shrink-0 text-[10px] font-bold text-neutral-700">${i === indice ? '▶' : i + 1}</span>
                <span class="min-w-0">
                    <span class="block truncate text-[11px] font-bold text-neutral-900">${pista.titulo}</span>
                    <span class="block truncate text-[10px] text-neutral-600">${pista.artista}</span>
                </span>`;
            item.addEventListener('click', () => {
                cargar(i, { iniciar: true });
                alternarLista(false);
            });
            ui.lista.appendChild(item);
        });
    }

    function alternarLista(forzar) {
        const abrir = typeof forzar === 'boolean' ? forzar : ui.lista.classList.contains('hidden');
        ui.lista.classList.toggle('hidden', !abrir);
        ui.listaBtn.setAttribute('aria-expanded', String(abrir));
    }

    function pintar() {
        const pista = PISTAS[indice];
        ui.titulo.textContent = pista ? pista.titulo : 'Sin pistas';
        ui.artista.textContent = pista ? pista.artista : '—';
        ui.play.innerHTML = audio.paused ? ICONO_PLAY : ICONO_PAUSA;
        ui.play.setAttribute('aria-label', audio.paused ? 'Reproducir' : 'Pausar');
        const vacio = PISTAS.length === 0;
        [ui.play, ui.next, ui.seek].forEach(el => el.disabled = vacio);
        if (audio.duration) {
            ui.seek.max = audio.duration;
            ui.seek.value = audio.currentTime;
        }
    }

    function cargar(i, { iniciar = false } = {}) {
        if (!PISTAS.length) return pintar();
        indice = (i + PISTAS.length) % PISTAS.length;
        audio.src = PISTAS[indice].archivo;
        audio.load();
        if (iniciar) reproducir();
        pintar();
        pintarLista();
        guardar();
    }

    function reproducir() {
        audio.play().catch(() => pintar());
    }

    function alternar() {
        audio.paused ? reproducir() : audio.pause();
    }

    function mostrar() {
        panel.classList.remove('hidden');
        boton.classList.add('hidden');
        abierto = true;
        boton.setAttribute('aria-expanded', 'true');
        pintar();
        guardar();
    }

    function ocultar() {
        panel.classList.add('hidden');
        boton.classList.remove('hidden');
        abierto = false;
        boton.setAttribute('aria-expanded', 'false');
        guardar();
    }

    /* --- restauración --- */
    audio.volume = guardado.volumen;

    if (PISTAS.length) {
        indice = Math.min(guardado.indice || 0, PISTAS.length - 1);
        audio.src = PISTAS[indice].archivo;
        audio.addEventListener('loadedmetadata', () => {
            if (guardado.tiempo && guardado.tiempo < audio.duration) {
                audio.currentTime = guardado.tiempo;
            }
            pintar();
        }, { once: true });
    }

    // Los navegadores solo permiten audio tras un gesto: reanudamos en el primero.
    if (guardado.reproduciendo && PISTAS.length) {
        reproducir(); // intento inmediato (puede fallar por la política de autoplay)
        const reanudar = () => {
            window.removeEventListener('pointerdown', reanudar);
            window.removeEventListener('keydown', reanudar);
            if (audio.paused) reproducir();
        };
        window.addEventListener('pointerdown', reanudar);
        window.addEventListener('keydown', reanudar);
    }

    if (guardado.abierto) mostrar();

    /* --- eventos --- */
    boton.addEventListener('click', () => (abierto ? ocultar() : mostrar()));
    document.getElementById('cerrar-musica').addEventListener('click', ocultar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && abierto) ocultar();
    });

    ui.play.addEventListener('click', alternar);
    ui.next.addEventListener('click', () => cargar(indice + 1, { iniciar: true }));
    ui.listaBtn.addEventListener('click', () => alternarLista());
    ui.seek.addEventListener('input', () => {
        audio.currentTime = Number(ui.seek.value);
    });

    audio.addEventListener('play', () => { pintar(); guardar(); });
    audio.addEventListener('pause', () => { pintar(); guardar(); });
    audio.addEventListener('ended', () => cargar(indice + 1, { iniciar: true }));
    audio.addEventListener('error', () => {
        ui.artista.textContent = 'No se pudo cargar el audio';
    });
    audio.addEventListener('timeupdate', () => {
        ui.seek.value = audio.currentTime;
        if (Date.now() - ultimoGuardado > 2000) {
            ultimoGuardado = Date.now();
            guardar();
        }
    });

    pintar();
    pintarLista();

    return { mostrar, ocultar };
})();

/* ---------- Blip al pulsar botones ---------- */
let ctxBlip;
function blip() {
    try {
        ctxBlip = ctxBlip || new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctxBlip.createOscillator();
        const g = ctxBlip.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctxBlip.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctxBlip.currentTime + 0.08);
        g.gain.setValueAtTime(0.05, ctxBlip.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctxBlip.currentTime + 0.12);
        osc.connect(g).connect(ctxBlip.destination);
        osc.start();
        osc.stop(ctxBlip.currentTime + 0.13);
    } catch { /* el navegador no permite audio */ }
}

document.addEventListener('click', (e) => {
    if (e.target.closest('button')) blip();
});

/* ---------- Contacto por WhatsApp ---------- */
(() => {
    const TELEFONO = '584246441382';
    const modal = document.getElementById('modal-whatsapp');
    const abrir = document.getElementById('btn-whatsapp');
    const cerrar = document.getElementById('cerrar-whatsapp');
    const form = document.getElementById('form-whatsapp');
    let ultimoFoco = null;

    function mostrar() {
        ultimoFoco = document.activeElement;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        document.getElementById('wa-nombre').focus();
    }

    function ocultar() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        if (ultimoFoco) ultimoFoco.focus();
    }

    abrir.addEventListener('click', mostrar);
    cerrar.addEventListener('click', ocultar);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) ocultar();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) ocultar();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('wa-nombre').value.trim();
        const producto = document.getElementById('wa-producto').value;
        const detalle = document.getElementById('wa-mensaje').value.trim();

        let mensaje = `¡Hola Melódico Design! Soy ${nombre} y necesito ayuda con ${producto}.`;
        if (detalle) mensaje += `\n\n${detalle}`;
        mensaje += '\n\n¿Me pueden orientar con la compra?';

        window.open(`https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener');
        ocultar();
    });
})();
