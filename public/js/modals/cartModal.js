export function initCartModal() {
    const placeholder = document.getElementById('cart-modal-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <div id="cart-modal" class="modal hidden" data-testid="cart-modal">
            <div class="modal-content cart-content">
                <span class="close-btn" id="closeCartModal" data-testid="close-cart-button">&times;</span>
                <h2>Your Cart</h2>
                <div id="cart-items" data-testid="cart-items-container"></div>
                <div class="cart-total">
                    <strong>Total: </strong>
                    <span id="cart-total-price" data-testid="cart-total-price">$ 0.00</span>
                </div>
                <button id="btnCheckout" class="btn-buy" data-testid="checkout-button">Checkout</button>
            </div>
        </div>
    `;
}