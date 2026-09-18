let isInitialized = false;

// --- DELEGAÇÃO GLOBAL DE EVENTOS DE CLIQUE ---
document.addEventListener('click', (e) => {
    const modal = document.getElementById('auth-modal');
    const successModal = document.getElementById('success-modal');

    // 1. Abrir Modal de Login/Registro
    if (e.target.closest('#btnLogin')) {
        if (localStorage.getItem('userLogged')) {
            localStorage.removeItem('userLogged');
            verifyLoginStatus();
            return;
        }
        if (modal) modal.classList.remove('hidden');
    }

    // 2. Fechar Modal de Login
    if (e.target.closest('#closeAuthModal')) {
        if (modal) modal.classList.add('hidden');
    }

    // 3. Fechar Modal de Sucesso (Botão OK)
    if (e.target.closest('#closeSuccessModal')) {
        if (successModal) successModal.classList.add('hidden');
    }

    // 4. Alternar para a aba de Cadastro
    if (e.target.closest('#show-register')) {
        e.preventDefault();
        document.getElementById('login-section')?.classList.add('hidden');
        document.getElementById('register-section')?.classList.remove('hidden');
    }

    // 5. Alternar para a aba de Login
    if (e.target.closest('#show-login')) {
        e.preventDefault();
        document.getElementById('register-section')?.classList.add('hidden');
        document.getElementById('login-section')?.classList.remove('hidden');
    }
});

// --- INICIALIZAÇÃO SEGURA ---
document.addEventListener('DOMContentLoaded', initAuthEvents);
if (document.readyState !== 'loading') initAuthEvents();

function initAuthEvents() {
    if (isInitialized) return;
    isInitialized = true;

    verifyLoginStatus();

    if (new URLSearchParams(window.location.search).get('auth') === 'login') {
        document.getElementById('auth-modal')?.classList.remove('hidden');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Submit de Registro (com Auto-Login)
    const btnRegister = document.getElementById('btnSubmitRegister');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const errorMsg = document.getElementById('password-error');

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;

            if (!username || !email) {
                alert("Please fill in all fields!");
                return;
            }

            if (!passwordRegex.test(password)) {
                errorMsg?.classList.remove('hidden');
                return;
            }
            errorMsg?.classList.add('hidden');

            let users = JSON.parse(localStorage.getItem('pokeshop_users')) || [];
            if (users.find(u => u.username === username)) {
                alert("This username already exists!");
                return;
            }

            // 1. Salva o novo usuário no banco/localStorage
            users.push({ username, email, password });
            localStorage.setItem('pokeshop_users', JSON.stringify(users));

            // 2. EFETUA O LOGIN AUTOMÁTICO
            localStorage.setItem('userLogged', username);
            verifyLoginStatus();

            // 3. FECHA O MODAL DE CADASTRO/LOGIN
            document.getElementById('auth-modal')?.classList.add('hidden');

            // 4. Exibe mensagem de boas-vindas no modal de sucesso
            const successMsg = document.getElementById('success-message');
            if (successMsg) {
                successMsg.textContent = `Welcome, ${username}! Your account was created and you are now logged in.`;
            }
            document.getElementById('success-modal')?.classList.remove('hidden');

            // Limpa os campos do formulário
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
        });
    }

    // Submit de Login Manual
    const btnLoginSubmit = document.getElementById('btnSubmitLogin');
    if (btnLoginSubmit) {
        btnLoginSubmit.addEventListener('click', () => {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            let users = JSON.parse(localStorage.getItem('pokeshop_users')) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                localStorage.setItem('userLogged', username);
                document.getElementById('auth-modal')?.classList.add('hidden');
                verifyLoginStatus();
            } else {
                alert("Incorrect username or password!");
            }
        });
    }
}

export function verifyLoginStatus() {
    const user = localStorage.getItem('userLogged');
    const container = document.getElementById('auth-action-container');
    if (!container) return;

    if (user) {
        const initial = user.charAt(0).toUpperCase();
        container.innerHTML = `
            <div id="user-profile-icon" class="user-avatar" data-testid="user-avatar" title="Go to Profile">
                ${initial}
            </div>
        `;
        document.getElementById('user-profile-icon')?.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    } else {
        container.innerHTML = `
            <button id="btnLogin" data-testid="login-button" class="btn-header-login">Sign In / Register</button>
        `;
    }
}