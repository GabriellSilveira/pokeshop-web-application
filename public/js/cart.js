import { cart, setCart } from './state.js';
import { showToast } from './toast.js';

export function buy(name, price, sprite) {
    cart.push({ name, price, sprite });
    document.getElementById('cart-count').innerText = cart.length;
    localStorage.setItem('pokeshop_cart', JSON.stringify(cart));
    
    // Chama o seu toast original mantendo o seu design!
    showToast(name, sprite);
}

export function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('cart-count').innerText = cart.length;
    localStorage.setItem('pokeshop_cart', JSON.stringify(cart));
    updateCartScreen();
}

export function configureCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn') || document.getElementById('cart-count');
    const closeCartBtn = document.getElementById('closeCartModal');
    const btnCheckout = document.getElementById('btnCheckout');

    // Abre o Carrinho
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateCartScreen();
            if (cartModal) cartModal.classList.remove('hidden');
        });
    }

    // Fecha o Carrinho
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.add('hidden');
        });
    }

    // Botão de Checkout (Avança para o pagamento)
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty! Add some Pokémon first.');
                return;
            }

            // Verifica se está logado (cobre os dois nomes de variável que usamos)
            const user = localStorage.getItem('userLogged') || localStorage.getItem('userLogado');
            if (!user) {
                alert('You need to log in before checking out!');
                cartModal.classList.add('hidden');
                document.getElementById('auth-modal')?.classList.remove('hidden');
                return;
            }

            // FIX APLICADO: Esconde o modal do carrinho e abre o modal de Checkout 
            // para continuar o fluxo de Endereço -> Pagamento -> Sucesso
            cartModal.classList.add('hidden');
            
            const checkoutModal = document.getElementById('checkout-modal');
            if (checkoutModal) {
                checkoutModal.classList.remove('hidden');
            } else {
                console.error("Checkout modal não encontrado!");
            }
        });
    }
}

export function updateCartScreen() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    if (!cartItemsContainer || !cartTotalPrice) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: #64748b;">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item-card';
            div.setAttribute('data-testid', `cart-item-${item.name}`);
            div.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.sprite || 'img/placeholder.png'}" alt="${item.name}" class="cart-item-img">
                    <span class="cart-item-name" data-testid="cart-item-name">${item.name}</span>
                </div>
                <div class="cart-item-right">
                    <span class="cart-item-price" data-testid="cart-item-price">$ ${item.price}.00</span>
                    <button class="cart-remove-btn" onclick="window.removeFromCartIndex(${index})" title="Remove item" data-testid="remove-cart-item">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }
    
    cartTotalPrice.innerText = `$ ${total}.00`;
}

// Expõe a função no window para que o onclick do botão de remover funcione
window.removeFromCartIndex = removeFromCart;