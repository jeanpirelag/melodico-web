/* Shop layer: customer session, cart and orders against /api/shop */
(() => {
    const TOKEN_KEY = 'melodico-shop-token';
    const GUEST_CART_KEY = 'melodico-guest-cart';
    const WHATSAPP = '584246441382';

    const isFile = location.protocol === 'file:';
    const isForeignDevPort = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port && location.port !== '3000';
    const apiOverride = document.querySelector('meta[name="melodico-api"]')?.content?.trim();
    const API_BASE = apiOverride || (isFile || isForeignDevPort ? 'http://localhost:3000/api' : '/api');

    const el = (id) => document.getElementById(id);

    const state = {
        token: localStorage.getItem(TOKEN_KEY) || '',
        customer: null,
        cart: [],
        lastOrder: null,
        authTab: 'login',
    };

    /* ---------------- API ---------------- */

    async function api(path, { method = 'GET', body, auth = true } = {}) {
        const headers = { 'Content-Type': 'application/json' };
        if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

        const response = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });

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
        container.classList.toggle('hidden', false);
        container.innerHTML = '<p class="text-xs text-neutral-500">Cargando…</p>';

        try {
            const { orders } = await api('/shop/orders');
            container.innerHTML = '';
            if (!orders.length) {
                container.innerHTML = '<p class="text-xs text-neutral-500">Todavía no tienes pedidos.</p>';
                return;
            }
            const list = document.createElement('ul');
            list.className = 'space-y-1 text-xs';
            orders.forEach((order) => {
                const item = document.createElement('li');
                item.className = 'flex items-center justify-between gap-3 border-b border-neutral-200 pb-1';
                const ref = document.createElement('span');
                ref.className = 'font-bold';
                ref.textContent = order.reference;
                const meta = document.createElement('span');
                meta.className = 'text-neutral-500';
                meta.textContent = `${formatPrice(order.total)} · ${order.status}`;
                item.append(ref, meta);
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

    document.addEventListener('click', (event) => {
        const add = event.target.closest('[data-add-cart]');
        if (add) addToCart(add.dataset.addCart);
    });

    el('btn-cart').addEventListener('click', openCart);
    el('btn-account').addEventListener('click', openAuth);
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
        try {
            const { token, customer } = await api('/shop/auth/register', {
                method: 'POST',
                auth: false,
                body: {
                    name: el('register-name').value.trim(),
                    email: el('register-email').value.trim(),
                    phone: el('register-phone').value.trim(),
                    password: el('register-password').value,
                },
            });
            saveSession(token, customer);
            el('register-password').value = '';
            setModal('auth-modal', false);
            refreshCart();
        } catch (error) {
            el('auth-error').textContent = error.message;
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
