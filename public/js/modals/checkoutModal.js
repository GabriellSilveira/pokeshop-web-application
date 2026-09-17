export function initCheckoutModal() {
    const placeholder = document.getElementById('checkout-modal-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <div id="checkout-modal" class="modal hidden" data-testid="checkout-modal">
            <div class="modal-content checkout-container">
                <button id="closeCheckout" class="close-btn" data-testid="close-checkout-button">&times;</button>
                
                <!-- Passos -->
                <div class="checkout-steps">
                    <span class="step active" id="step-indicator-1">1. Address</span>
                    <span class="step" id="step-indicator-2">2. Payment</span>
                    <span class="step" id="step-indicator-3">3. Review</span>
                </div>

                <!-- Passo 1: Endereço -->
                <div id="checkout-step-1" class="checkout-step-content" data-testid="checkout-step-1">
                    <h2>Shipping Address</h2>
                    <div class="form-group">
                        <input type="text" id="ship-name" placeholder="Full Name" required />
                        <input type="text" id="ship-address" placeholder="Street Address" required />
                        <div class="form-row">
                            <input type="text" id="ship-city" placeholder="City" required />
                            <input type="text" id="ship-zip" placeholder="ZIP / CEP" required />
                        </div>
                    </div>
                    <button id="btn-to-payment" class="btn-auth" data-testid="btn-to-payment" style="margin-top: 20px;">Proceed to Payment &rarr;</button>
                </div>

                <!-- Passo 2: Pagamento -->
                <div id="checkout-step-2" class="checkout-step-content hidden" data-testid="checkout-step-2">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="margin: 0;">Payment Details</h2>
                        <div class="tooltip-container" style="position: relative; cursor: pointer;">
                            <span class="tooltip-icon" data-testid="payment-info-icon" title="Stripe Info">i</span>
                            <div class="tooltip-text">
                                Use Stripe test card:<br><b style="color: #38bdf8;">4242 4242 4242 4242</b>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <input type="text" id="card-name" placeholder="Cardholder Name" required />
                        <input type="text" id="card-number" placeholder="Card Number (4242...)" maxlength="19" required />
                        <div class="form-row">
                            <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5" required />
                            <input type="text" id="card-cvc" placeholder="CVC (123)" maxlength="4" required />
                        </div>
                    </div>
                    <p id="payment-error" class="error-msg hidden" style="color: #ef5350; font-size: 0.9rem; margin-top: 10px;"></p>
                    <div class="button-group">
                        <button id="btn-back-to-address" class="btn-secondary">&larr; Back</button>
                        <button id="btn-to-review" class="btn-auth" data-testid="btn-to-review">Review Order &rarr;</button>
                    </div>
                </div>

                <!-- Passo 3: Revisão -->
                <div id="checkout-step-3" class="checkout-step-content hidden" data-testid="checkout-step-3">
                    <h2>Order Summary</h2>
                    <div id="checkout-items-summary" class="summary-list"></div>
                    <div class="summary-totals">
                        <p>Shipping: <strong id="summary-address-text"></strong></p>
                        <p>Payment: <strong id="summary-payment-text"></strong></p>
                        <h3>Total: <span id="summary-total-price">$0.00</span></h3>
                    </div>
                    <div class="button-group">
                        <button id="btn-back-to-payment" class="btn-secondary">&larr; Back</button>
                        <button id="btn-confirm-order" class="btn-auth btn-success" data-testid="btn-confirm-order">Complete Purchase</button>
                    </div>
                </div>

                <!-- Tela de Sucesso -->
                <div id="checkout-step-success" class="checkout-step-content hidden success-step" data-testid="checkout-step-success">
                    <h2>🎉 Order Confirmed!</h2>
                    <p>Thank you for your purchase.</p>
                    <p style="margin-bottom: 20px;">Order ID: <strong id="order-id-display">#PK-000000</strong></p>
                    <button id="btn-finish-checkout" class="btn-auth" data-testid="btn-finish-checkout" style="width: 60%; margin: 0 auto;">Back to Shop</button>
                </div>
            </div>
        </div>
    `;
}