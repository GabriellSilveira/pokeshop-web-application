import { cart } from './state.js';

export function initNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    // Detecta a página atual para marcar o link ativo corretamente
    const path = window.location.pathname;
    const isHome = path.includes('index.html') || path === '/' || path.endsWith('/');
    const isPokedex = path.includes('pokedex.html');

    // Injeta o HTML genérico do Header
    placeholder.innerHTML = `
        <header class="navbar">
            <div class="navbar-brand">
                <a href="index.html">
                    <img src="img/logo.png" alt="PokéShop Logo" class="nav-logo">
                </a>
            </div>
            
            <nav>
                <ul class="nav-links">
                    <li>
                        <a href="index.html" class="${isHome ? 'active' : ''}" data-testid="nav-home">
                            <img src="img/home-icon.png" alt="Home Icon" class="nav-icon"> Home
                        </a>
                    </li>
                    <li>
                        <a href="pokedex.html" class="${isPokedex ? 'active' : ''}" data-testid="nav-pokedex">
                            <img src="img/pokedex-icon.png" alt="Pokedex Icon" class="nav-icon"> Pokedex
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="header-actions">
                <!-- Theme Toggle (O HTML fica, mas a lógica vai pro theme.js) -->
                <div id="themeToggle" class="theme-toggle" data-testid="theme-toggle" title="Toggle Dark/Light Mode" style="cursor: pointer; font-size: 1.2rem; padding: 5px 10px; border-radius: 6px; background: rgba(0,0,0,0.1);">
                    <span class="toggle-icon">☀️</span>
                    <span class="toggle-icon">🌙</span>
                </div>

                <!-- Cart Button -->
                <button id="cart-btn" class="cart-btn" data-testid="cart-button">
                    <img src="img/cart-icon.png" alt="Cart Icon" class="cart-icon">
                    <span>Cart</span>
                    <span id="cart-count" class="cart-badge" data-testid="cart-count">0</span>
                </button>
                
                <!-- Auth Container (Login Button or Avatar) -->
                <div id="auth-action-container">
                    <button id="btnLogin" data-testid="login-button" class="btn-header-login">Sign In / Register</button>
                </div>
            </div>
        </header>
    `;

    // 1. Atualizar Contador do Carrinho
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        try {
            cartCountEl.innerText = cart ? cart.length : 0;
        } catch (e) {
            cartCountEl.innerText = '0';
        }
    }

    // 2. Abrir Modal do Carrinho ao clicar no botão da navbar
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const cartModal = document.getElementById('cart-modal');
            if (cartModal) {
                if (typeof window.atualizarTelaCarrinho === 'function') {
                    window.atualizarTelaCarrinho();
                }
                cartModal.classList.remove('hidden');
            }
        });
    }

    // 3. Gerenciar Estado de Autenticação (Botão de Login ou Avatar do Perfil)
    const loggedUser = localStorage.getItem('userLogged');
    const authContainer = document.getElementById('auth-action-container');
    if (authContainer) {
        if (loggedUser) {
            authContainer.innerHTML = `
                <div class="user-avatar" id="userAvatarBtn" title="${loggedUser}" style="cursor: pointer; width: 36px; height: 36px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${loggedUser.charAt(0).toUpperCase()}
                </div>
            `;
            const avatarBtn = document.getElementById('userAvatarBtn');
            if (avatarBtn) {
                avatarBtn.addEventListener('click', () => {
                    window.location.href = 'profile.html';
                });
            }
        } else {
            authContainer.innerHTML = `
                <button id="btnLogin" data-testid="login-button" class="btn-header-login">Sign In / Register</button>
            `;
            const loginBtn = document.getElementById('btnLogin');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    const authModal = document.getElementById('auth-modal');
                    if (authModal) authModal.classList.remove('hidden');
                });
            }
        }
    }
}