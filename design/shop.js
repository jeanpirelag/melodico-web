/* Shop layer: customer session, cart and orders against /api/shop */
(() => {
    const TOKEN_KEY = 'melodico-shop-token';
    const GUEST_CART_KEY = 'melodico-guest-cart';
    const WHATSAPP = '584246441382';
    const API_BASE = window.MELODICO_API_BASE || '/api';

    const el = (id) => document.getElementById(id);

    const state = {
        token: localStorage.getItem(TOKEN_KEY) || '',
        customer: null,
        cart: [],
        lastOrder: null,
        authTab: 'login',
        challenge: null,
    };

    /* ---------------- API ---------------- */

    async function api(path, { method = 'GET', body, auth = true } = {}) {
        const headers = { 'Content-Type': 'application/json' };
        if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        } catch {
            throw new Error(`No se pudo conectar con el servidor (${API_BASE}). Revisa que esté encendido y que el origen esté permitido.`);
        }

        const data = await response.json().catch(() => ({}));
        if (response.status === 401 && auth && state.token) {
            clearSession();
        }
        if (!response.ok) {
            const error = new Error(data.error || 'No se pudo conectar con el servidor');
            error.status = response.status;
            throw error;
        }
        return data;
    }

    /* ---------------- Bot protection (proof of work) ---------------- */

    async function loadChallenge() {
        try {
            state.challenge = await api('/shop/auth/challenge', { auth: false });
        } catch {
            state.challenge = null;
        }
    }

    function decodePayload(token) {
        const part = token.split('.')[1] || '';
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }

    async function solveProof(challenge) {
        const { c } = decodePayload(challenge.token);
        const prefix = '0'.repeat(challenge.difficulty);
        const encoder = new TextEncoder();

        for (let nonce = 0; nonce < 5_000_000; nonce++) {
            const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${c}:${nonce}`));
            const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
            if (hex.startsWith(prefix)) return String(nonce);
        }
        throw new Error('No se pudo completar la verificación anti-bots');
    }

    /* ---------------- Session ---------------- */

    function saveSession(token, customer) {
        state.token = token;
        state.customer = customer;
        localStorage.setItem(TOKEN_KEY, token);
        renderAccount();
        mergeGuestCart();
    }

    function clearSession() {
        state.token = '';
        state.customer = null;
        localStorage.removeItem(TOKEN_KEY);
        renderAccount();
    }

    function renderAccount() {
        const label = el('account-label');
        if (label) label.textContent = state.customer ? state.customer.name.split(' ')[0] : 'Ingresar';
        el('account-name').textContent = state.customer?.name || '';
        el('account-email').textContent = state.customer?.email || '';
        el('auth-tabs').classList.toggle('hidden', Boolean(state.customer));
        el('login-form').classList.toggle('hidden', state.authTab !== 'login' || Boolean(state.customer));
        el('register-form').classList.toggle('hidden', state.authTab !== 'register' || Boolean(state.customer));
        el('account-panel').classList.toggle('hidden', !state.customer);
        if (!state.customer) el('my-orders').classList.add('hidden');
        prefillContactName();
    }

    // Signed-in customers do not have to type their name in the WhatsApp form.
    function prefillContactName() {
        if (!state.customer) return;
        const input = el('wa-name');
        if (input && !input.value.trim()) input.value = state.customer.name;
    }

    function setAuthTab(tab) {
        state.authTab = tab;
        el('auth-error').textContent = '';
        el('login-form').classList.toggle('hidden', tab !== 'login');
        el('register-form').classList.toggle('hidden', tab !== 'register');
        document.querySelectorAll('[data-auth-tab]').forEach((button) => {
            const active = button.dataset.authTab === tab;
            button.classList.toggle('bg-[#6699FF]', active);
            button.classList.toggle('bg-white', !active);
        });
        if (tab === 'register') loadChallenge();
    }

    /* ---------------- Cart ---------------- */

    function loadGuestCart() {
        try {
            return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveGuestCart() {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.cart));
    }

    function currentCart() {
        return state.customer ? state.cart : loadGuestCart();
    }

    function setCart(items) {
        state.cart = items;
        if (!state.customer) saveGuestCart();
        renderCart();
    }

    function cartCount(items) {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }

    function renderCartBadge() {
        const count = cartCount(currentCart());
        const badge = el('cart-count');
        badge.textContent = String(count);
        badge.classList.toggle('hidden', count === 0);
    }

    function formatPrice(value) {
        return value === null || value === undefined ? 'A cotizar' : `$${Number(value).toFixed(2)}`;
    }

    function renderCart() {
        const items = currentCart();
        const list = el('cart-items');
        list.innerHTML = '';
        el('cart-empty').classList.toggle('hidden', items.length > 0);
        el('checkout-box').classList.toggle('hidden', items.length === 0);

        const total = items.every((item) => item.unitPrice !== null) && items.length
            ? items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            : null;
        el('cart-total').textContent = formatPrice(total);

        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'flex items-center gap-3 py-3';

            const info = document.createElement('div');
            info.className = 'min-w-0 flex-1';
            const name = document.createElement('p');
            name.className = 'truncate text-sm font-bold text-neutral-900';
            name.textContent = item.name;
            const price = document.createElement('p');
            price.className = 'text-xs text-neutral-500';
            price.textContent = `${formatPrice(item.unitPrice)} · ${item.quantity} u.`;
            info.append(name, price);

            const controls = document.createElement('div');
            controls.className = 'flex items-center gap-1';

            const minus = document.createElement('button');
            minus.type = 'button';
            minus.className = 'h-7 w-7 rounded-full border-2 border-neutral-900 bg-white text-sm font-bold';
            minus.textContent = '−';
            minus.setAttribute('aria-label', `Quitar una unidad de ${item.name}`);
            minus.addEventListener('click', () => changeQuantity(item.slug, item.quantity - 1));

            const plus = document.createElement('button');
            plus.type = 'button';
            plus.className = 'h-7 w-7 rounded-full border-2 border-neutral-900 bg-white text-sm font-bold';
            plus.textContent = '+';
            plus.setAttribute('aria-label', `Agregar una unidad de ${item.name}`);
            plus.addEventListener('click', () => changeQuantity(item.slug, item.quantity + 1));

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'ml-1 h-7 w-7 rounded-full border-2 border-neutral-900 bg-white text-xs font-bold';
            remove.textContent = '✕';
            remove.setAttribute('aria-label', `Quitar ${item.name} del carrito`);
            remove.addEventListener('click', () => removeItem(item.slug));

            controls.append(minus, plus, remove);
            row.append(info, controls);
            list.appendChild(row);
        });

        renderCartBadge();
    }

    async function addToCart(slug) {
        const product = (window.MELODICO_PRODUCTS || []).find((item) => item.slug === slug);
        if (!product) return;

        el('cart-error').textContent = '';

        if (!state.customer) {
            const items = loadGuestCart();
            const existing = items.find((item) => item.slug === slug);
            if (existing) existing.quantity = Math.min(existing.quantity + 1, 99);
            else items.push({ slug, name: product.name, unitPrice: product.price ?? null, quantity: 1 });
            setCart(items);
            return;
        }

        try {
            const { items } = await api('/shop/cart', {
                method: 'POST',
                body: { slug, name: product.name, unitPrice: product.price ?? null, quantity: 1 },
            });
            setCart(items);
        } catch (error) {
            showCartError(error.message);
        }
    }

    async function changeQuantity(slug, quantity) {
        if (quantity < 1) return removeItem(slug);

        if (!state.customer) {
            const items = loadGuestCart();
            const item = items.find((entry) => entry.slug === slug);
            if (item) item.quantity = Math.min(quantity, 99);
            setCart(items);
            return;
        }

        try {
            const { items } = await api(`/shop/cart/${encodeURIComponent(slug)}`, { method: 'PATCH', body: { quantity } });
            setCart(items);
        } catch (error) {
            showCartError(error.message);
        }
    }

    async function removeItem(slug) {
        if (!state.customer) {
            setCart(loadGuestCart().filter((item) => item.slug !== slug));
            return;
        }
        try {
            const { items } = await api(`/shop/cart/${encodeURIComponent(slug)}`, { method: 'DELETE' });
            setCart(items);
        } catch (error) {
            showCartError(error.message);
        }
    }

    async function refreshCart() {
        if (!state.customer) return setCart(loadGuestCart());
        try {
            const { items } = await api('/shop/cart');
            setCart(items);
        } catch {
            renderCartBadge();
        }
    }

    async function mergeGuestCart() {
        const guestItems = loadGuestCart();
        if (!guestItems.length || !state.customer) return;
        try {
            for (const item of guestItems) {
                await api('/shop/cart', {
                    method: 'POST',
                    body: { slug: item.slug, name: item.name, unitPrice: item.unitPrice, quantity: item.quantity },
                });
            }
            localStorage.removeItem(GUEST_CART_KEY);
            refreshCart();
        } catch {
            refreshCart();
        }
    }

    /* ---------------- Orders ---------------- */

    async function checkout() {
        el('cart-error').textContent = '';

        if (!state.customer) {
            showCartError('Inicia sesión o crea una cuenta para confirmar el pedido.');
            openAuth();
            return;
        }

        const button = el('checkout');
        button.disabled = true;
        button.textContent = 'Confirmando…';

        try {
            const { order } = await api('/shop/orders', {
                method: 'POST',
                body: { notes: el('cart-notes').value.trim() },
            });
            state.lastOrder = order;
            setCart([]);
            showOrderDone(order);
        } catch (error) {
            showCartError(error.message);
        } finally {
            button.disabled = false;
            button.textContent = 'Confirmar pedido';
        }
    }

    function showOrderDone(order) {
        el('checkout-box').classList.add('hidden');
        el('cart-empty').classList.add('hidden');
        el('order-done').classList.remove('hidden');
        el('order-reference').textContent = order.reference;

        const lines = order.items.map((item) => `• ${item.quantity} × ${item.name} (${formatPrice(item.unitPrice)})`);
        const message = [
            `¡Hola Melódico Design! Soy ${state.customer.name}.`,
            `Pedido ${order.reference}:`,
            ...lines,
            order.total !== null ? `Total: $${Number(order.total).toFixed(2)}` : 'Total: por cotizar',
        ].join('\n');

        el('order-whatsapp').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    }

    async function loadMyOrders() {
        const container = el('my-orders');
        container.classList.remove('hidden');
        container.innerHTML = '<p class="text-xs text-neutral-500">Cargando…</p>';

        try {
            const { orders } = await api('/shop/orders');
            container.innerHTML = '';
            if (!orders.length) {
                container.innerHTML = '<p class="text-xs text-neutral-500">Todavía no tienes pedidos.</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'space-y-2';

            const statusLabels = {
                pending: 'Pendiente',
                confirmed: 'Cotizado',
                paid: 'Pagado',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado',
            };

            const statusColors = {
                pending: { bg: '#fef3c7', color: '#92400e', border: '#92400e' },
                confirmed: { bg: '#dcfce7', color: '#166534', border: '#166534' },
                paid: { bg: '#bbf7d0', color: '#14532d', border: '#14532d' },
                shipped: { bg: '#e0e7ff', color: '#3730a3', border: '#3730a3' },
                delivered: { bg: '#166534', color: '#ffffff', border: '#166534' },
                cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#991b1b' },
            };

            orders.forEach((order) => {
                const item = document.createElement('li');
                item.className = 'rounded-lg border-2 border-neutral-900 bg-white';

                const head = document.createElement('button');
                head.type = 'button';
                head.className = 'flex w-full items-center justify-between gap-2 px-3 py-2 text-left';
                head.setAttribute('aria-expanded', 'false');

                const info = document.createElement('span');
                info.className = 'min-w-0';
                const reference = document.createElement('span');
                reference.className = 'block text-xs font-bold text-neutral-900';
                reference.textContent = order.reference;
                const date = document.createElement('span');
                date.className = 'block text-[10px] text-neutral-500';
                date.textContent = new Date(order.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString('es-VE');
                info.append(reference, date);

                const meta = document.createElement('span');
                meta.className = 'flex shrink-0 flex-col items-end gap-1';
                const total = document.createElement('span');
                total.className = 'text-xs font-bold text-neutral-900';
                total.textContent = formatPrice(order.total);

                const isQuote = order.total === null && order.status === 'pending';
                const palette = isQuote
                    ? { bg: '#dbeafe', color: '#1e3a8a', border: '#1e3a8a' }
                    : statusColors[order.status] || statusColors.pending;
                const status = document.createElement('span');
                status.className = 'inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold';
                status.style.background = palette.bg;
                status.style.color = palette.color;
                status.style.borderColor = palette.border;
                status.textContent = isQuote ? 'A cotizar' : (statusLabels[order.status] || order.status);

                meta.append(total, status);

                head.append(info, meta);

                const detail = document.createElement('div');
                detail.className = 'hidden border-t-2 border-neutral-900 px-3 py-2 text-[11px] text-neutral-600';

                head.addEventListener('click', async () => {
                    const open = !detail.classList.contains('hidden');
                    head.setAttribute('aria-expanded', String(!open));
                    if (open) {
                        detail.classList.add('hidden');
                        return;
                    }
                    detail.classList.remove('hidden');
                    if (detail.dataset.loaded) return;

                    detail.textContent = 'Cargando…';
                    try {
                        const { order: full } = await api(`/shop/orders/${encodeURIComponent(order.reference)}`);
                        detail.innerHTML = '';
                        full.items.forEach((line) => {
                            const row = document.createElement('p');
                            row.className = 'flex justify-between gap-3';
                            const name = document.createElement('span');
                            name.textContent = `${line.quantity} × ${line.name}`;
                            const price = document.createElement('span');
                            price.textContent = formatPrice(line.unitPrice);
                            row.append(name, price);
                            detail.appendChild(row);
                        });
                        detail.dataset.loaded = '1';
                    } catch (error) {
                        detail.textContent = error.message;
                    }
                });

                item.append(head, detail);
                list.appendChild(item);
            });

            container.appendChild(list);
        } catch (error) {
            container.innerHTML = '';
            const message = document.createElement('p');
            message.className = 'text-xs text-red-700';
            message.textContent = error.message;
            container.appendChild(message);
        }
    }

    /* ---------------- Modals ---------------- */

    function setModal(id, open) {
        const modal = el(id);
        modal.classList.toggle('hidden', !open);
        modal.classList.toggle('flex', open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) modal.querySelector('input, button, textarea')?.focus();
    }

    function openAuth() {
        setAuthTab(state.customer ? 'login' : state.authTab);
        renderAccount();
        if (state.customer) loadMyOrders();
        setModal('auth-modal', true);
    }

    function openCart() {
        el('order-done').classList.add('hidden');
        renderCart();
        setModal('cart-modal', true);
    }

    function showCartError(message) {
        el('cart-error').textContent = message;
    }

    /* ---------------- Events ---------------- */

    document.addEventListener('click', async (event) => {
        const add = event.target.closest('[data-add-cart]');
        if (add) addToCart(add.dataset.addCart);

        const buy = event.target.closest('[data-buy]');
        if (buy) {
            await addToCart(buy.dataset.buy);
            openCart();
        }
    });

    el('btn-cart').addEventListener('click', openCart);
    el('btn-account').addEventListener('click', openAuth);
    el('btn-whatsapp').addEventListener('click', prefillContactName);
    el('btn-account-mobile').addEventListener('click', () => {
        el('mobile-menu').classList.add('hidden');
        el('btn-menu').setAttribute('aria-expanded', 'false');
        openAuth();
    });

    el('cart-close').addEventListener('click', () => setModal('cart-modal', false));
    el('auth-close').addEventListener('click', () => setModal('auth-modal', false));
    el('order-close').addEventListener('click', () => setModal('cart-modal', false));

    ['cart-modal', 'auth-modal'].forEach((id) => {
        el(id).addEventListener('click', (event) => {
            if (event.target === el(id)) setModal(id, false);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!el('cart-modal').classList.contains('hidden')) setModal('cart-modal', false);
        if (!el('auth-modal').classList.contains('hidden')) setModal('auth-modal', false);
    });

    document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
        tab.addEventListener('click', () => setAuthTab(tab.dataset.authTab));
    });

    el('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        el('auth-error').textContent = '';
        try {
            const { token, customer } = await api('/shop/auth/login', {
                method: 'POST',
                auth: false,
                body: { email: el('login-email').value.trim(), password: el('login-password').value },
            });
            saveSession(token, customer);
            el('login-password').value = '';
            setModal('auth-modal', false);
            refreshCart();
        } catch (error) {
            el('auth-error').textContent = error.message;
        }
    });

    el('register-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        el('auth-error').textContent = '';

        const button = event.submitter || el('register-form').querySelector('button[type="submit"]');
        const originalLabel = button?.textContent;

        try {
            if (!state.challenge) await loadChallenge();
            if (!state.challenge) throw new Error('No se pudo verificar que seas una persona. Revisa tu conexión.');

            if (button) {
                button.disabled = true;
                button.textContent = 'Verificando…';
            }
            const proofNonce = await solveProof(state.challenge);

            const { token, customer } = await api('/shop/auth/register', {
                method: 'POST',
                auth: false,
                body: {
                    name: el('register-name').value.trim(),
                    email: el('register-email').value.trim(),
                    phone: el('register-phone').value.trim(),
                    password: el('register-password').value,
                    website: el('register-website').value,
                    proofToken: state.challenge.token,
                    proofNonce,
                },
            });

            saveSession(token, customer);
            el('register-password').value = '';
            setModal('auth-modal', false);
            refreshCart();
        } catch (error) {
            el('auth-error').textContent = error.message;
            state.challenge = null;
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = originalLabel || 'Crear cuenta';
            }
        }
    });

    el('logout').addEventListener('click', async () => {
        try {
            await api('/shop/auth/logout', { method: 'POST' });
        } catch { /* token is stateless; ignore */ }
        clearSession();
        setCart([]);
        setModal('auth-modal', false);
    });

    el('view-orders').addEventListener('click', loadMyOrders);
    el('checkout').addEventListener('click', checkout);

    /* ---------------- Boot ---------------- */

    async function boot() {
        setAuthTab('login');
        renderCart();
        renderCartBadge();

        if (!state.token) return;
        try {
            const { customer } = await api('/shop/auth/me');
            state.customer = customer;
            renderAccount();
            await refreshCart();
        } catch {
            clearSession();
        }
    }

    boot();
})();
