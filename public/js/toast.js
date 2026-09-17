// --- TOAST NOTIFICATION SYSTEM ---
export function showToast(pokemonName, pokemonSprite) {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const spriteUrl = pokemonSprite || 'img/placeholder.png';

    toast.innerHTML = `
        <div class="toast-icon-wrapper">
            <img src="${spriteUrl}" alt="${pokemonName}" class="toast-pokemon-img">
        </div>
        <div class="toast-content">
            <span class="toast-title">Success!</span>
            <span class="toast-message"><strong>${pokemonName}</strong> Added To Cart.</span>
        </div>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}