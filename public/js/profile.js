import { cart } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gerenciamento de Tema (Dark / Light Mode)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            const isDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('pokeshop_theme', isDark ? 'dark' : 'light');
        });
    }

    // 2. Carrinho e Dados do Usuário
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = cart.length;

    const loggedUser = localStorage.getItem('userLogged') || 'User';
    let userEmail = `${loggedUser.toLowerCase()}@gmail.com`;
    try {
        const savedUsers = JSON.parse(localStorage.getItem('pokeshop_users')) || [];
        const found = savedUsers.find(u => u.username === loggedUser);
        if (found && found.email) {
            userEmail = found.email;
        }
    } catch (e) {}

    document.getElementById('profile-display-name').innerText = loggedUser;
    document.getElementById('profile-display-email').innerText = userEmail;
    document.getElementById('input-name').value = loggedUser;
    document.getElementById('text-email').innerText = userEmail;
    document.getElementById('profile-avatar').innerText = loggedUser.charAt(0);

    // Avatar no Header
    const authContainer = document.getElementById('auth-action-container');
    if (authContainer) {
        authContainer.innerHTML = `
            <div class="user-avatar" id="userAvatarBtn" title="${loggedUser}" style="cursor: pointer; width: 36px; height: 36px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${loggedUser.charAt(0)}
            </div>
        `;
        document.getElementById('userAvatarBtn').addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // 3. Máscara para Telefone Padrão USA: (XXX) XXX-XXXX
    const mobileContainer = document.getElementById('mobile-number-container');
    const savedPhone = localStorage.getItem('userPhone') || '';
    
    function renderPhoneInput(val = '') {
        mobileContainer.innerHTML = `
            <input type="text" id="input-mobile" class="profile-field-value" placeholder="(555) 000-0000" maxlength="14" value="${val}">
        `;
        const input = document.getElementById('input-mobile');
        input.addEventListener('input', function() {
            let numbers = this.value.replace(/\D/g, '');
            if (numbers.length > 10) numbers = numbers.substring(0, 10);
            
            let formatted = '';
            if (numbers.length > 0) {
                formatted = '(' + numbers.substring(0, 3);
            }
            if (numbers.length >= 4) {
                formatted += ') ' + numbers.substring(3, 6);
            }
            if (numbers.length >= 7) {
                formatted += '-' + numbers.substring(6, 10);
            }
            this.value = formatted;
        });
    }

    if (savedPhone) {
        renderPhoneInput(savedPhone);
    } else {
        const btnAddNum = document.getElementById('btnAddNumber');
        if (btnAddNum) {
            btnAddNum.addEventListener('click', () => {
                renderPhoneInput();
            });
        }
    }

    // 4. Salvar Alterações e Exibir Modal Customizado
    const btnSave = document.getElementById('btnSaveProfile');
    const successModal = document.getElementById('profile-success-modal');
    const successMessage = document.getElementById('profile-success-message');
    const closeSuccessModal = document.getElementById('closeProfileSuccessModal');

    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const newName = document.getElementById('input-name').value.trim();
            const phoneInput = document.getElementById('input-mobile');
            
            if (!newName) {
                alert('Name cannot be empty!');
                return;
            }

            if (phoneInput) {
                const phoneVal = phoneInput.value.replace(/\D/g, '');
                if (phoneVal.length > 0 && phoneVal.length < 10) {
                    alert('Please enter a valid USA phone number: (XXX) XXX-XXXX');
                    return;
                }
                localStorage.setItem('userPhone', phoneInput.value);
            }

            localStorage.setItem('userLogged', newName);
            document.getElementById('profile-display-name').innerText = newName;
            document.getElementById('profile-avatar').innerText = newName.charAt(0);

            // Exibe o modal customizado de sucesso com mensagem de perfil
            if (successMessage) successMessage.innerText = 'Profile updated successfully!';
            if (successModal) successModal.classList.remove('hidden');
        });
    }

    if (closeSuccessModal && successModal) {
        closeSuccessModal.addEventListener('click', () => {
            successModal.classList.add('hidden');
        });
    }

    // 5. Change Password Modal Logic
    const btnOpenPassModal = document.getElementById('btnOpenChangePassword');
    const passModal = document.getElementById('change-password-modal');
    const closePassModal = document.getElementById('closePasswordModal');
    const btnSubmitPass = document.getElementById('btnSubmitNewPassword');

    if (btnOpenPassModal && passModal) {
        btnOpenPassModal.addEventListener('click', () => {
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            document.getElementById('pwd-error-msg').classList.add('hidden');
            passModal.classList.remove('hidden');
        });
    }

    if (closePassModal && passModal) {
        closePassModal.addEventListener('click', () => {
            passModal.classList.add('hidden');
        });
    }

    if (btnSubmitPass) {
        btnSubmitPass.addEventListener('click', () => {
            const currentPass = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            const errorMsg = document.getElementById('pwd-error-msg');

            if (!currentPass || !newPass || !confirmPass) {
                errorMsg.textContent = 'Please fill in all fields!';
                errorMsg.classList.remove('hidden');
                return;
            }

            if (newPass !== confirmPass) {
                errorMsg.textContent = 'New passwords do not match!';
                errorMsg.classList.remove('hidden');
                return;
            }

            // Validação de força de senha
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;
            if (!passwordRegex.test(newPass)) {
                errorMsg.textContent = 'Password must have min 5 chars, 1 uppercase, 1 number, and 1 special char.';
                errorMsg.classList.remove('hidden');
                return;
            }

            let users = JSON.parse(localStorage.getItem('pokeshop_users')) || [];
            const userIndex = users.findIndex(u => u.username === loggedUser);

            if (userIndex === -1) {
                errorMsg.textContent = 'User session error. Please log in again.';
                errorMsg.classList.remove('hidden');
                return;
            }

            if (users[userIndex].password !== currentPass) {
                errorMsg.textContent = 'Current password is incorrect!';
                errorMsg.classList.remove('hidden');
                return;
            }

            // Atualiza a senha no banco de dados local
            users[userIndex].password = newPass;
            localStorage.setItem('pokeshop_users', JSON.stringify(users));

            // Fecha o modal de senha e abre o modal bonito de sucesso!
            passModal.classList.add('hidden');
            if (successMessage) successMessage.innerText = 'Password updated successfully!';
            if (successModal) successModal.classList.remove('hidden');
        });
    }

    // 6. Botão de Logout
    const btnLogout = document.getElementById('btnLogoutProfile');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('userLogged');
            localStorage.removeItem('userLogado');
            window.location.href = 'index.html';
        });
    }
});