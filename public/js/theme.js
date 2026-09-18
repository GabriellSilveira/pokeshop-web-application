export function initTheme() {
    // 1. Carrega o tema salvo ao abrir a página
    const savedTheme = localStorage.getItem('pokeshop_theme') || 'light';
    document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');

    // 2. Adiciona o evento de clique no botão da Navbar
    // ATENÇÃO: Essa função só deve ser chamada DEPOIS que a navbar foi desenhada na tela
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');

            const isDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('pokeshop_theme', isDark ? 'dark' : 'light');
        });
    }
}