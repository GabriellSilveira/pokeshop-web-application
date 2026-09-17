let currentStep = 1;

// Inicializador chamado pelo index.html após injetar o modal
export function configureCheckout() {
    setupInputMasks();
    setupCheckoutEvents();
}

function setupInputMasks() {
    // 1. ZIP / CEP: Apenas números
    const zipInput = document.getElementById('ship-zip');
    if (zipInput) {
        zipInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // 2. Número do Cartão: Apenas números, máx 16, espaço a cada 4
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
        cardInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, ''); 
            if (val.length > 16) val = val.substring(0, 16);
            this.value = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        });
    }

    // 3. Validade (MM/YY)
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 4) val = val.substring(0, 4);
            if (val.length > 2) {
                this.value = val.substring(0, 2) + '/' + val.substring(2);
            } else {
                this.value = val;
            }
        });
    }

    // 4. CVV: Apenas números, máx 3 dígitos
    const cvcInput = document.getElementById('card-cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 3) val = val.substring(0, 3);
            this.value = val;
        });
    }
}

function isValidStripeTestCard(number) {
    const cleanNum = number.replace(/\s+/g, '');
    return cleanNum === '4242424242424242' || (cleanNum.length === 16 && !isNaN(cleanNum));
}

function setupCheckoutEvents() {
    document.addEventListener('click', (e) => {
        // 1. Avançar para o Passo 2
        if (e.target.closest('#btn-to-payment')) {
            const name = document.getElementById('ship-name').value.trim();
            const address = document.getElementById('ship-address').value.trim();
            const city = document.getElementById('ship-city').value.trim();
            const zip = document.getElementById('ship-zip').value.trim();

            if (!name || !address || !city || !zip) {
                alert('Please fill in all shipping details!');
                return;
            }
            goToStep(2);
        }

        // 2. Avançar para o Passo 3
        if (e.target.closest('#btn-to-review')) {
            const cardNum = document.getElementById('card-number').value.replace(/\s+/g, '');
            const expiry = document.getElementById('card-expiry').value;
            const cvc = document.getElementById('card-cvc').value;
            const errorMsg = document.getElementById('payment-error');

            if (!isValidStripeTestCard(cardNum)) {
                errorMsg.textContent = 'Invalid card number! Must be 16 digits.';
                errorMsg.classList.remove('hidden');
                return;
            }

            const parts = expiry.split('/');
            if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
                errorMsg.textContent = 'Please enter a valid expiration date (MM/YY).';
                errorMsg.classList.remove('hidden');
                return;
            }

            const month = parseInt(parts[0], 10);
            const year = parseInt(parts[1], 10);

            if (isNaN(month) || month < 1 || month > 12) {
                errorMsg.textContent = 'Invalid month! Must be between Jan and Dec.';
                errorMsg.classList.remove('hidden');
                return;
            }

            if (isNaN(year) || year < 26) {
                errorMsg.textContent = 'Invalid year! Year cannot be less than 2026.';
                errorMsg.classList.remove('hidden');
                return;
            }

            if (cvc.length < 3) {
                errorMsg.textContent = 'Invalid CVC! Must be 3 digits.';
                errorMsg.classList.remove('hidden');
                return;
            }

            errorMsg.classList.add('hidden');
            renderOrderSummary();
            goToStep(3);
        }

        // Botões de Voltar
        if (e.target.closest('#btn-back-to-address')) goToStep(1);
        if (e.target.closest('#btn-back-to-payment')) goToStep(2);

        // 3. Confirmar Compra
        if (e.target.closest('#btn-confirm-order')) {
            const randomOrderId = '#PK-' + Math.floor(100000 + Math.random() * 900000);
            document.getElementById('order-id-display').textContent = randomOrderId;

            // --- LÓGICA DA POKÉDEX: SALVAR INVENTÁRIO DO USUÁRIO ---
            const loggedUser = localStorage.getItem('userLogged');
            if (loggedUser) {
                const inventoryKey = `pokedex_inventory_${loggedUser}`;
                let userInventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
                const currentCart = JSON.parse(localStorage.getItem('pokeshop_cart')) || [];

                currentCart.forEach(item => {
                    // Impede duplicatas (só salva se o usuário ainda não tiver o Pokémon)
                    if (!userInventory.includes(item.name)) {
                        userInventory.push(item.name);
                    }
                });

                localStorage.setItem(inventoryKey, JSON.stringify(userInventory));
            }
            // --------------------------------------------------------

            localStorage.removeItem('pokeshop_cart');
            const cartCount = document.getElementById('cart-count');
            if(cartCount) cartCount.innerText = 0;

            goToStep('success');
        }

        // 4. Finalizar e Fechar
        if (e.target.closest('#btn-finish-checkout') || e.target.closest('#closeCheckout')) {
            document.getElementById('checkout-modal')?.classList.add('hidden');
            window.location.reload();
        }
    });
}

function goToStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.checkout-steps .step').forEach(el => el.classList.remove('active'));

    const stepsHeader = document.querySelector('.checkout-steps');

    if (step === 'success') {
        if (stepsHeader) stepsHeader.classList.add('hidden');
        document.getElementById('checkout-step-success').classList.remove('hidden');
        return;
    }

    if (stepsHeader) stepsHeader.classList.remove('hidden');

    currentStep = step;
    document.getElementById(`checkout-step-${step}`)?.classList.remove('hidden');
    document.getElementById(`step-indicator-${step}`)?.classList.add('active');
}

function renderOrderSummary() {
    const address = document.getElementById('ship-address').value;
    const city = document.getElementById('ship-city').value;
    const cardNum = document.getElementById('card-number').value.replace(/\s+/g, '');
    const last4 = cardNum.slice(-4);

    document.getElementById('summary-address-text').textContent = `${address}, ${city}`;
    document.getElementById('summary-payment-text').textContent = `Credit Card ending in **** ${last4}`;

    const cart = JSON.parse(localStorage.getItem('pokeshop_cart')) || [];
    const container = document.getElementById('checkout-items-summary');
    
    let total = 0;
    
    container.innerHTML = cart.map(item => {
        const qty = item.quantity || 1; 
        const itemTotal = item.price * qty;
        total += itemTotal;
        
        return `
            <div class="cart-item-card" style="margin-bottom: 10px; cursor: default; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white;">
                <div class="cart-item-info" style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.sprite || 'img/placeholder.png'}" alt="${item.name}" class="cart-item-img" style="width: 48px; height: 48px; object-fit: contain;">
                    <span class="cart-item-name" style="text-transform: capitalize; font-weight: bold; color: #334155;">${item.name}</span>
                </div>
                <div class="cart-item-right">
                    <span class="cart-item-price" style="color: #10b981; font-weight: bold;">$ ${itemTotal.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('summary-total-price').textContent = `$${total.toFixed(2)}`;
}