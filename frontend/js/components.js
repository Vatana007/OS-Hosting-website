/* ========================================
   SHARED COMPONENTS - All Pages Use This
   ======================================== */

let userWishlist = [];

// ===== APPLY SAVED THEME =====
(function () {
    const t = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
})();

function getTheme() { return localStorage.getItem('theme') || 'light'; }

function toggleTheme() {
    const t = getTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    const icon = document.querySelector('.theme-toggle i');
    if (icon) icon.className = 'fas fa-' + (t === 'dark' ? 'sun' : 'moon');
}

// ===== RENDER NAVBAR =====
function renderNavbar() {
    const user = Api.getUser();
    const logged = Api.isLoggedIn();
    const admin = Api.isAdmin();
    const p = location.pathname;
    const themIcon = getTheme() === 'dark' ? 'sun' : 'moon';

    // Announcement bar
    const bar = document.createElement('div');
    bar.className = 'announcement-bar';
    bar.innerHTML = '<i class="fas fa-gift"></i> Free shipping on orders over $50 &nbsp;|&nbsp; <i class="fas fa-percent"></i> Up to 40% OFF Summer Sale';
    document.body.prepend(bar);

    // Navbar
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = `
    <div class="container">
        <a href="/" class="logo">
            <div class="logo-icon"><i class="fas fa-store"></i></div>
            Shop<span>Hub</span>
        </a>
        <ul class="nav-links" id="navLinks">
            <li><a href="/" class="${p === '/' || p === '/index.html' ? 'active' : ''}"><i class="fas fa-home"></i><span>Home</span></a></li>
            ${logged ? `
                <li><a href="/wishlist.html" class="${p === '/wishlist.html' ? 'active' : ''}" style="position:relative"><i class="fas fa-heart"></i><span>Wishlist</span><span class="wishlist-badge" id="wishCount" style="display:none">0</span></a></li>
                <li><a href="#" class="cart-link" onclick="openCartDrawer();return false"><i class="fas fa-shopping-bag"></i><span>Cart</span><span class="cart-badge" id="cartCount" style="display:none">0</span></a></li>
                <li><a href="/orders.html" class="${p === '/orders.html' ? 'active' : ''}"><i class="fas fa-box"></i><span>Orders</span></a></li>
                ${admin ? `<li><a href="/admin.html" class="${p === '/admin.html' ? 'active' : ''}"><i class="fas fa-gauge-high"></i><span>Admin</span></a></li>` : ''}
            ` : `
                <li><a href="/login.html" class="btn-nav"><i class="fas fa-sign-in-alt"></i><span>Sign In</span></a></li>
                <li><a href="/register.html"><i class="fas fa-user-plus"></i><span>Register</span></a></li>
            `}
        </ul>
        <div class="nav-right">
            <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme"><i class="fas fa-${themIcon}"></i></button>
            ${logged ? `
                <div class="nav-user" onclick="toggleUserMenu(event)">
                    <div class="nav-user-trigger">
                        <div class="user-avatar">${(user?.name || 'U')[0].toUpperCase()}</div>
                        <span class="nav-username">${user?.name || 'Account'}</span>
                        <i class="fas fa-chevron-down" style="font-size:.55rem;color:var(--text-muted)"></i>
                    </div>
                    <div class="nav-user-menu" id="userMenu">
                        <div class="nav-user-info">
                            <div class="name">${user?.name}</div>
                            <div class="email">${user?.email}</div>
                        </div>
                        <a href="/profile.html"><i class="fas fa-user-circle"></i> My Profile</a>
                        <a href="/orders.html"><i class="fas fa-box"></i> My Orders</a>
                        <a href="/wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
                        <hr>
                        <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            ` : ''}
            <button class="hamburger" onclick="openMobileMenu()"><i class="fas fa-bars"></i></button>
        </div>
    </div>`;
    document.body.prepend(nav);

    if (logged) {
        createCartDrawer();
        updateCartCount();
        loadWishlistIds();
    }
    createMobileMenu();
    createBackToTop();

    document.addEventListener('click', () => {
        const m = document.getElementById('userMenu');
        if (m) m.classList.remove('show');
    });
}

// ===== MOBILE MENU =====
function createMobileMenu() {
    const user = Api.getUser();
    const logged = Api.isLoggedIn();
    const admin = Api.isAdmin();

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.id = 'mobileOverlay';
    overlay.onclick = closeMobileMenu;
    document.body.appendChild(overlay);

    const menu = document.createElement('div');
    menu.className = 'mobile-menu';
    menu.id = 'mobileMenu';
    menu.innerHTML = `
        <button class="close-mobile" onclick="closeMobileMenu()"><i class="fas fa-times"></i></button>
        <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">
            <div class="logo" style="font-size:1.3rem"><div class="logo-icon" style="width:32px;height:32px;font-size:.85rem"><i class="fas fa-store"></i></div>Shop<span>Hub</span></div>
        </div>
        <a href="/"><i class="fas fa-home"></i> Home</a>
        ${logged ? `
            <a href="#" onclick="closeMobileMenu();setTimeout(openCartDrawer,200);return false"><i class="fas fa-shopping-bag"></i> Cart</a>
            <a href="/wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
            <a href="/orders.html"><i class="fas fa-box"></i> Orders</a>
            <a href="/profile.html"><i class="fas fa-user-circle"></i> Profile</a>
            ${admin ? '<a href="/admin.html"><i class="fas fa-gauge-high"></i> Admin Panel</a>' : ''}
            <div style="border-top:1px solid var(--border);margin:12px 0"></div>
            <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
        ` : `
            <a href="/login.html"><i class="fas fa-sign-in-alt"></i> Sign In</a>
            <a href="/register.html"><i class="fas fa-user-plus"></i> Register</a>
        `}
    `;
    document.body.appendChild(menu);
}

function openMobileMenu() {
    document.getElementById('mobileOverlay').classList.add('show');
    document.getElementById('mobileMenu').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.getElementById('mobileOverlay').classList.remove('show');
    document.getElementById('mobileMenu').classList.remove('show');
    document.body.style.overflow = '';
}

// ===== CART DRAWER =====
function createCartDrawer() {
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'drawerOverlay';
    overlay.onclick = closeCartDrawer;
    document.body.appendChild(overlay);

    const drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
        <div class="drawer-header">
            <h3><i class="fas fa-shopping-bag"></i> Your Cart</h3>
            <button class="drawer-close" onclick="closeCartDrawer()"><i class="fas fa-times"></i></button>
        </div>
        <div class="drawer-body" id="drawerBody"><div class="loading"><div class="spinner"></div></div></div>
        <div class="drawer-footer" id="drawerFooter" style="display:none"></div>
    `;
    document.body.appendChild(drawer);
}

function openCartDrawer() {
    document.getElementById('drawerOverlay').classList.add('show');
    document.getElementById('cartDrawer').classList.add('show');
    document.body.style.overflow = 'hidden';
    loadDrawerCart();
}

function closeCartDrawer() {
    document.getElementById('drawerOverlay')?.classList.remove('show');
    document.getElementById('cartDrawer')?.classList.remove('show');
    document.body.style.overflow = '';
}

async function loadDrawerCart() {
    const body = document.getElementById('drawerBody');
    const footer = document.getElementById('drawerFooter');
    try {
        const d = await Api.get('/cart');
        const cart = d.cart;
        if (!cart.length) {
            body.innerHTML = `<div class="drawer-empty"><i class="fas fa-shopping-bag"></i><h3 style="margin:12px 0 6px;color:var(--text)">Your cart is empty</h3><p style="font-size:.9rem">Add some products to get started</p></div>`;
            footer.style.display = 'none';
            return;
        }
        const sub = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const ship = sub > 50 ? 0 : 9.99;
        const total = sub + ship;

        body.innerHTML = cart.map(i => `
            <div class="drawer-item">
                <img src="${i.product.image}" alt="" onclick="closeCartDrawer();location.href='/product.html?id=${i.product._id}'" style="cursor:pointer" onerror="this.src='https://placehold.co/72x72/e2e8f0/64748b?text=•'">
                <div class="drawer-item-info">
                    <div class="drawer-item-name">${i.product.name}</div>
                    <div class="drawer-item-price">${formatPrice(i.product.price)}</div>
                    <div class="drawer-item-qty">
                        <button onclick="drawerUpdateQty('${i.product._id}',${i.quantity - 1})"><i class="fas fa-minus"></i></button>
                        <span>${i.quantity}</span>
                        <button onclick="drawerUpdateQty('${i.product._id}',${i.quantity + 1})"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <button class="drawer-item-remove" onclick="drawerRemoveItem('${i.product._id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        `).join('');

        footer.style.display = 'block';
        footer.innerHTML = `
            <div class="drawer-totals">
                <div class="row"><span>Subtotal</span><span>${formatPrice(sub)}</span></div>
                <div class="row"><span>Shipping</span><span class="${ship === 0 ? 'free-ship' : ''}">${ship === 0 ? 'FREE' : formatPrice(ship)}</span></div>
                <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
            </div>
            <a href="/cart.html" class="btn btn-secondary btn-block" style="margin-top:14px" onclick="closeCartDrawer()"><i class="fas fa-shopping-cart"></i> View Full Cart</a>
            <a href="/checkout.html" class="btn btn-primary btn-block" style="margin-top:8px" onclick="closeCartDrawer()"><i class="fas fa-lock"></i> Checkout — ${formatPrice(total)}</a>
        `;
    } catch (e) {
        body.innerHTML = `<p style="padding:20px;color:var(--text-muted)">Error loading cart</p>`;
    }
}

async function drawerUpdateQty(pid, qty) {
    if (qty <= 0) return drawerRemoveItem(pid);
    try { await Api.put(`/cart/${pid}`, { quantity: qty }); loadDrawerCart(); updateCartCount(); }
    catch (e) { showToast(e.message, 'error'); }
}

async function drawerRemoveItem(pid) {
    try { await Api.delete(`/cart/${pid}`); loadDrawerCart(); updateCartCount(); showToast('Item removed'); }
    catch (e) { showToast(e.message, 'error'); }
}

async function updateCartCount() {
    try {
        const d = await Api.get('/cart');
        const c = d.cart.reduce((s, i) => s + i.quantity, 0);
        const b = document.getElementById('cartCount');
        if (b) { b.textContent = c; b.style.display = c > 0 ? '' : 'none'; }
    } catch (e) { /* ignore */ }
}

// ===== WISHLIST =====
async function loadWishlistIds() {
    try {
        const d = await Api.get('/wishlist');
        userWishlist = d.wishlist.map(p => p._id);
        const b = document.getElementById('wishCount');
        if (b) { b.textContent = userWishlist.length; b.style.display = userWishlist.length > 0 ? '' : 'none'; }
    } catch (e) { /* ignore */ }
}

async function toggleWishlist(pid, btn) {
    if (!Api.isLoggedIn()) { showToast('Please sign in first', 'warning'); return; }
    try {
        const d = await Api.post(`/wishlist/${pid}`);
        userWishlist = d.wishlist.map(p => p._id);
        if (btn) {
            btn.classList.toggle('wishlisted', d.added);
            btn.innerHTML = `<i class="fa${d.added ? 's' : 'r'} fa-heart"></i>`;
        }
        showToast(d.added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
        const wb = document.getElementById('wishCount');
        if (wb) { wb.textContent = userWishlist.length; wb.style.display = userWishlist.length > 0 ? '' : 'none'; }
    } catch (e) { showToast(e.message, 'error'); }
}

function isWishlisted(pid) { return userWishlist.includes(pid); }

// ===== BACK TO TOP =====
function createBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.id = 'backToTop';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 500);
    });
}

// ===== USER MENU =====
function toggleUserMenu(e) {
    e.stopPropagation();
    document.getElementById('userMenu').classList.toggle('show');
}

function logout() {
    Api.removeToken();
    location.href = '/login.html';
}

// ===== FOOTER =====
function renderFooter() {
    const f = document.createElement('footer');
    f.className = 'footer';
    f.innerHTML = `
    <div class="footer-grid">
        <div class="footer-brand">
            <h4><i class="fas fa-store" style="color:var(--primary);margin-right:8px"></i>ShopHub</h4>
            <p>Your premium destination for quality products at amazing prices. Shop with confidence — fast shipping, easy returns, and 24/7 support.</p>
            <div class="footer-social">
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
        <div class="footer-links">
            <h4>Shop</h4>
            <a href="/?category=Electronics"><i class="fas fa-chevron-right"></i> Electronics</a>
            <a href="/?category=Clothing"><i class="fas fa-chevron-right"></i> Clothing</a>
            <a href="/?category=Books"><i class="fas fa-chevron-right"></i> Books</a>
            <a href="/?category=Sports"><i class="fas fa-chevron-right"></i> Sports</a>
            <a href="/?category=Beauty"><i class="fas fa-chevron-right"></i> Beauty</a>
        </div>
        <div class="footer-links">
            <h4>Account</h4>
            <a href="/profile.html"><i class="fas fa-chevron-right"></i> My Profile</a>
            <a href="/orders.html"><i class="fas fa-chevron-right"></i> Orders</a>
            <a href="/wishlist.html"><i class="fas fa-chevron-right"></i> Wishlist</a>
            <a href="/cart.html"><i class="fas fa-chevron-right"></i> Cart</a>
        </div>
        <div>
            <h4>Newsletter</h4>
            <div class="footer-newsletter">
                <p>Subscribe to get 10% off your first order and exclusive deals delivered to your inbox.</p>
                <form class="newsletter-form" onsubmit="event.preventDefault();showToast('Subscribed successfully! 🎉');this.reset();">
                    <input type="email" placeholder="Your email" required>
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} ShopHub. All rights reserved. Made with <i class="fas fa-heart"></i></p>
    </div>`;
    document.body.appendChild(f);
}

// ===== TOAST NOTIFICATIONS =====
function initToast() {
    if (!document.querySelector('.toast-container')) {
        const c = document.createElement('div');
        c.className = 'toast-container';
        document.body.appendChild(c);
    }
}

function showToast(msg, type = 'success') {
    initToast();
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `
        <i class="fas ${icons[type] || icons.success}"></i>
        <span>${msg}</span>
        <button class="close-toast" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    document.querySelector('.toast-container').appendChild(t);
    setTimeout(() => {
        if (t.parentElement) {
            t.style.opacity = '0';
            t.style.transform = 'translateX(100%)';
            setTimeout(() => t.remove(), 300);
        }
    }, 4000);
}

// ===== HELPERS =====
function starsHTML(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += `<i class="fa${i <= Math.round(rating) ? 's' : 'r'} fa-star"></i>`;
    }
    return `<span class="stars">${s}</span>`;
}

function formatPrice(price) {
    return '$' + Number(price).toFixed(2);
}

function showLoading(el) {
    el.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
}

function showSkeleton(el, count = 8) {
    el.innerHTML = Array(count).fill('<div class="skeleton skeleton-card animate-in"></div>').join('');
}

const catIcons = {
    Electronics: 'fa-laptop',
    Clothing: 'fa-shirt',
    Books: 'fa-book-open',
    Home: 'fa-couch',
    Sports: 'fa-basketball',
    Toys: 'fa-puzzle-piece',
    Beauty: 'fa-spa',
    Food: 'fa-utensils'
};

function catIcon(category) {
    return catIcons[category] || 'fa-tag';
}

// ===== ADD TO CART HELPER =====
async function addToCart(pid, qty = 1, btn = null) {
    if (!Api.isLoggedIn()) {
        showToast('Please sign in to add items', 'warning');
        setTimeout(() => location.href = '/login.html', 1500);
        return;
    }
    try {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Added!';
            btn.classList.add('added');
        }
        await Api.post('/cart', { productId: pid, quantity: qty });
        showToast('Added to cart!');
        updateCartCount();
        setTimeout(() => {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                btn.classList.remove('added');
            }
        }, 2000);
    } catch (e) {
        showToast(e.message, 'error');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
            btn.classList.remove('added');
        }
    }
}

// ===== QUICK VIEW MODAL =====
async function openQuickView(pid) {
    try {
        const d = await Api.get(`/products/${pid}`);
        const p = d.product;
        const discount = p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'quickViewModal';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `
        <div class="modal" style="max-width:880px">
            <button class="modal-close" onclick="document.getElementById('quickViewModal').remove()"><i class="fas fa-times"></i></button>
            <div class="quick-view-content">
                <div class="quick-view-image">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/e2e8f0/64748b?text=Product'">
                </div>
                <div class="quick-view-info">
                    <span class="qv-category"><i class="fas ${catIcon(p.category)}"></i> ${p.category}</span>
                    <h2>${p.name}</h2>
                    <div class="qv-rating">${starsHTML(p.rating)} <span class="review-count">(${p.numReviews} reviews)</span></div>
                    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:12px 0">
                        <span class="qv-price">${formatPrice(p.price)}</span>
                        ${discount ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:1.1rem">${formatPrice(p.comparePrice)}</span><span class="save-badge"><i class="fas fa-tag"></i> Save ${discount}%</span>` : ''}
                    </div>
                    <p class="qv-desc">${p.description}</p>
                    <div style="margin:12px 0">
                        <span class="stock-status ${p.stock > 0 ? 'in-stock' : 'out-stock'}">
                            <i class="fas fa-${p.stock > 0 ? 'check-circle' : 'times-circle'}"></i>
                            ${p.stock > 0 ? 'In Stock (' + p.stock + ')' : 'Out of Stock'}
                        </span>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:16px">
                        <button class="btn btn-primary btn-lg" style="flex:1" onclick="addToCart('${p._id}');document.getElementById('quickViewModal').remove()" ${p.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-secondary btn-lg btn-icon ${isWishlisted(p._id) ? 'wishlisted' : ''}" onclick="toggleWishlist('${p._id}',this)" style="font-size:1.1rem;width:48px;flex-shrink:0">
                            <i class="fa${isWishlisted(p._id) ? 's' : 'r'} fa-heart"></i>
                        </button>
                    </div>
                    <a href="/product.html?id=${p._id}" class="btn btn-ghost btn-block" style="margin-top:10px" onclick="document.getElementById('quickViewModal').remove()">
                        View Full Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        overlay.addEventListener('click', function handler(e) {
            if (e.target === overlay) { document.body.style.overflow = ''; }
        });
    } catch (e) {
        showToast('Could not load product details', 'error');
    }
}

// ===== SEARCH SUGGESTIONS =====
let searchTimeout;
function setupLiveSearch(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let dropdown = document.getElementById('searchDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.id = 'searchDropdown';
        input.closest('.hero-search').appendChild(dropdown);
    }

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const q = input.value.trim();
        if (q.length < 2) { dropdown.classList.remove('show'); return; }
        searchTimeout = setTimeout(async () => {
            try {
                const d = await Api.get(`/products/suggestions?q=${encodeURIComponent(q)}`);
                if (!d.suggestions.length) { dropdown.classList.remove('show'); return; }
                dropdown.innerHTML = d.suggestions.map(p => `
                    <div class="search-item" onclick="location.href='/product.html?id=${p._id}'">
                        <img src="${p.image}" alt="" onerror="this.src='https://placehold.co/40x40/e2e8f0/64748b?text=•'">
                        <div class="search-item-info">
                            <div class="search-item-name">${p.name}</div>
                            <div class="search-item-price">${formatPrice(p.price)} <span style="color:var(--text-muted);font-size:.75rem">in ${p.category}</span></div>
                        </div>
                        <i class="fas fa-arrow-right" style="color:var(--text-muted);font-size:.7rem"></i>
                    </div>
                `).join('');
                dropdown.classList.add('show');
            } catch (e) { /* ignore */ }
        }, 300);
    });

    input.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('show'), 250));
    input.addEventListener('focus', () => { if (input.value.trim().length >= 2) input.dispatchEvent(new Event('input')); });
}

// ===== PRODUCT CARD HTML =====
function productCardHTML(p) {
    const discount = p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    return `
    <div class="product-card animate-in">
        <div class="product-image-wrap" onclick="location.href='/product.html?id=${p._id}'" style="cursor:pointer">
            <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x400/e2e8f0/64748b?text=Product'">
            <div class="product-badges">
                ${discount ? `<span class="badge badge-sale"><i class="fas fa-bolt"></i> ${discount}% OFF</span>` : ''}
                ${p.featured ? '<span class="badge badge-featured"><i class="fas fa-star"></i> Featured</span>' : ''}
            </div>
            <div class="product-actions-overlay">
                <button class="action-btn ${isWishlisted(p._id) ? 'wishlisted' : ''}" onclick="event.stopPropagation();toggleWishlist('${p._id}',this)" title="Wishlist">
                    <i class="fa${isWishlisted(p._id) ? 's' : 'r'} fa-heart"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation();openQuickView('${p._id}')" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category"><i class="fas ${catIcon(p.category)}"></i> ${p.category}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-rating">${starsHTML(p.rating)}<span class="review-count">(${p.numReviews})</span></div>
            <div class="product-pricing">
                <span class="price">${formatPrice(p.price)}</span>
                ${discount ? `<span class="compare-price">${formatPrice(p.comparePrice)}</span><span class="discount-pct">-${discount}%</span>` : ''}
            </div>
            <button class="add-cart-btn ${p.stock === 0 ? 'out-of-stock' : ''}" onclick="event.stopPropagation();addToCart('${p._id}',1,this)" ${p.stock === 0 ? 'disabled' : ''}>
                <i class="fas ${p.stock > 0 ? 'fa-cart-plus' : 'fa-ban'}"></i>
                ${p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    </div>`;
}