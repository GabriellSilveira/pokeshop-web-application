import { loadFeaturedPokemonDetails } from './api.js';

let activeTypes = [];
let activeGenerationUrl = null;
let activeGenerationName = null;
let searchQuery = "";
let userPokemonsDetailed = []; // Guarda todos os pokémons do usuário

document.addEventListener('DOMContentLoaded', async () => {
    setupDetailsPanel();
    const loggedUser = localStorage.getItem('userLogged');
    
    if (!loggedUser) {
        window.location.replace('index.html?auth=login');
        return;
    }

    await initPokedex(loggedUser);
});

function setupDetailsPanel() {
    const panel = document.getElementById('pokedex-details-panel');
    const closeButton = document.getElementById('close-pokedex-details');
    if (!panel || !closeButton) return;
    const layout = panel.closest('.pokedex-layout');

    closeButton.addEventListener('click', () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        layout?.classList.remove('details-open');
    });
}

async function openPokemonDetails(pokemonId) {
    const panel = document.getElementById('pokedex-details-panel');
    if (!panel) return;
    const layout = panel.closest('.pokedex-layout');

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    layout?.classList.add('details-open');
    await loadFeaturedPokemonDetails(pokemonId);
}

async function initPokedex(user) {
    const grid = document.getElementById('pokemon-grid');
    const inventoryKey = `pokedex_inventory_${user}`;
    
    const rawInventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];
    const userInventory = rawInventory;

    if (userInventory.length === 0) {
        showGlobalEmptyState();
        return;
    }

    // Inicializa UI de Filtros (Igualzinho ao seu filter.js)
    await initFiltersUI();
    setupSearchUI();

    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem;">Loading your Pokémon...</p>';

    try {
        const promises = userInventory.map(name => 
            fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json())
        );
        
        const pokemonsData = await Promise.all(promises);
        
        userPokemonsDetailed = pokemonsData.map(poke => ({
            name: poke.name,
            id: poke.id,
            sprite: poke.sprites.front_default,
            types: poke.types.map(t => t.type.name)
        })).sort((a, b) => a.id - b.id);
        
        renderPokemons(userPokemonsDetailed);

    } catch (error) {
        console.error('Error loading Pokedex:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Error loading your Pokédex.</p>';
    }
}

// ==========================================
// SEARCH LOGIC
// ==========================================
function setupSearchUI() {
    const searchInput = document.getElementById('pokedex-search');
    const searchBtn = document.getElementById('pokedex-search-btn');

    const handleSearch = () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        applyCombinedFilters();
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// ==========================================
// FILTERS UI (Baseado no seu filter.js)
// ==========================================
async function initFiltersUI() {
    const container = document.createElement('div');
    container.className = 'filters-container';
    // Força o container dos filtros a ficar centralizado abaixo da barra de pesquisa
    container.style.justifyContent = 'center'; 
    container.innerHTML = `
        <div class="filter-dropdown" id="type-dropdown">
            <button class="filter-btn" id="type-toggle">
                <span>🛡️ Type</span> <span>▼</span>
            </button>
            <div class="filter-menu hidden" id="type-menu"></div>
        </div>
        <div class="filter-dropdown" id="gen-dropdown">
            <button class="filter-btn" id="gen-toggle">
                <span>🧬 Generation</span> <span>▼</span>
            </button>
            <div class="filter-menu hidden" id="gen-menu"></div>
        </div>
        <button class="filter-reset-btn hidden" id="filter-reset">Reset Filters</button>
    `;

    const activeContainer = document.createElement('div');
    activeContainer.id = 'active-filters';
    activeContainer.className = 'active-filters-container';
    activeContainer.style.justifyContent = 'center'; // Centraliza as tags também

    const warningContainer = document.createElement('div');
    warningContainer.id = 'filter-warning';
    warningContainer.className = 'filter-warning-msg hidden';
    warningContainer.innerText = '⚠️ A Pokémon can have at most 2 types.';
    warningContainer.style.textAlign = 'center';

    const searchContainer = document.querySelector('.search-container');
    searchContainer.parentNode.insertBefore(container, searchContainer.nextSibling);
    container.parentNode.insertBefore(activeContainer, container.nextSibling);
    activeContainer.parentNode.insertBefore(warningContainer, activeContainer.nextSibling);

    setupDropdownToggles();
    await loadFilterOptions();
    setupResetButton();
}

function setupDropdownToggles() {
    const typeToggle = document.getElementById('type-toggle');
    const typeMenu = document.getElementById('type-menu');
    const genToggle = document.getElementById('gen-toggle');
    const genMenu = document.getElementById('gen-menu');

    typeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        typeMenu.classList.toggle('hidden');
        genMenu.classList.add('hidden');
    });

    genToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        genMenu.classList.toggle('hidden');
        typeMenu.classList.add('hidden');
    });

    typeMenu.addEventListener('click', (e) => e.stopPropagation());
    genMenu.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
        typeMenu.classList.add('hidden');
        genMenu.classList.add('hidden');
    });
}

async function loadFilterOptions() {
    try {
        const typeRes = await fetch('https://pokeapi.co/api/v2/type');
        const typeData = await typeRes.json();
        const typeMenu = document.getElementById('type-menu');
        
        typeData.results.forEach(t => {
            if (t.name === 'unknown' || t.name === 'shadow') return;
            const typeNameCap = t.name.charAt(0).toUpperCase() + t.name.slice(1);
            const item = document.createElement('div');
            item.className = `filter-option type-badge type-${t.name}`;
            item.innerHTML = `<img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${t.name}" class="type-icon">${t.name}`;
            
            item.addEventListener('click', () => {
                toggleTypeFilter(t.name);
                typeMenu.classList.add('hidden');
            });
            typeMenu.appendChild(item);
        });

        const genRes = await fetch('https://pokeapi.co/api/v2/generation');
        const genData = await genRes.json();
        const genMenu = document.getElementById('gen-menu');

        genData.results.forEach((g, index) => {
            const item = document.createElement('div');
            item.className = 'filter-option';
            const genLabel = `Generation ${index + 1}`;
            item.innerText = genLabel;
            
            item.addEventListener('click', () => {
                selectGenerationFilter(g.url, genLabel);
                genMenu.classList.add('hidden');
            });
            genMenu.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

function showWarning(show) {
    const warningEl = document.getElementById('filter-warning');
    if (!warningEl) return;
    if (show) warningEl.classList.remove('hidden');
    else warningEl.classList.add('hidden');
}

function toggleTypeFilter(typeName) {
    showWarning(false);
    if (activeTypes.includes(typeName)) {
        activeTypes = activeTypes.filter(t => t !== typeName);
    } else {
        if (activeTypes.length >= 2) {
            showWarning(true);
            return;
        }
        activeTypes.push(typeName);
    }
    applyCombinedFilters();
}

function selectGenerationFilter(genUrl, genLabel) {
    if (activeGenerationUrl === genUrl) {
        activeGenerationUrl = null;
        activeGenerationName = null;
    } else {
        activeGenerationUrl = genUrl;
        activeGenerationName = genLabel;
    }
    applyCombinedFilters();
}

// ==========================================
// PIPELINE DE FILTRAGEM (LOCAL)
// ==========================================
async function applyCombinedFilters() {
    renderActiveFiltersUI();
    showResetButton(activeTypes.length > 0 || activeGenerationUrl !== null || searchQuery !== "");

    showLoadingState();

    try {
        let candidateNames = null;

        // 1. Busca os nomes da Geração (da API global) para bater com o inventário
        if (activeGenerationUrl) {
            const genRes = await fetch(activeGenerationUrl);
            const genData = await genRes.json();
            candidateNames = new Set(genData.pokemon_species.map(s => s.name));
        }

        // 2. Filtra o Array Local
        let filteredList = userPokemonsDetailed;

        // Aplica Filtro de Geração
        if (candidateNames) {
            filteredList = filteredList.filter(poke => candidateNames.has(poke.name));
        }

        // Aplica Filtro de Tipo (Deve ter todos os tipos selecionados)
        if (activeTypes.length > 0) {
            filteredList = filteredList.filter(poke => {
                return activeTypes.every(activeType => poke.types.includes(activeType));
            });
        }

        // Aplica Filtro de Texto (Nome ou ID)
        if (searchQuery) {
            filteredList = filteredList.filter(poke => 
                poke.name.toLowerCase().includes(searchQuery) || 
                poke.id.toString() === searchQuery
            );
        }

        // 3. Renderiza o resultado
        renderPokemons(filteredList);

    } catch (error) {
        console.error('Error applying combined filters:', error);
        showEmptyState();
    }
}

// ==========================================
// RENDER UI HELPERS
// ==========================================
function renderActiveFiltersUI() {
    const container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = '';

    if (activeGenerationName) {
        const genTag = document.createElement('div');
        genTag.className = 'active-filter-tag';
        genTag.style.backgroundColor = '#3b82f6';
        genTag.style.color = 'white';
        genTag.innerHTML = `
            <span>🧬 ${activeGenerationName}</span>
            <span class="remove-gen-tag" style="cursor: pointer; margin-left: 6px; font-weight: bold;">×</span>
        `;
        genTag.querySelector('.remove-gen-tag').addEventListener('click', () => {
            activeGenerationUrl = null;
            activeGenerationName = null;
            applyCombinedFilters();
        });
        container.appendChild(genTag);
    }

    activeTypes.forEach(type => {
        const typeNameCap = type.charAt(0).toUpperCase() + type.slice(1);
        const tag = document.createElement('div');
        tag.className = `active-filter-tag type-badge type-${type}`; 
        tag.innerHTML = `
            <img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${type}" class="type-icon">
            <span>${type}</span> 
            <span class="remove-type-tag" data-type="${type}" style="cursor: pointer; margin-left: 6px; font-weight: bold;">×</span>
        `;
        tag.querySelector('.remove-type-tag').addEventListener('click', (e) => {
            const typeToRemove = e.target.getAttribute('data-type');
            toggleTypeFilter(typeToRemove);
        });
        container.appendChild(tag);
    });
}

function showLoadingState() {
    const grid = document.getElementById('pokemon-grid');
    if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">Filtering Pokémon...</p>';
}

function showResetButton(show) {
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        if (show) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
    }
}

function setupResetButton() {
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeTypes = [];
            activeGenerationUrl = null;
            activeGenerationName = null;
            searchQuery = "";
            document.getElementById('pokedex-search').value = "";
            showWarning(false);
            renderActiveFiltersUI();
            showResetButton(false);
            
            // Restaura o grid original do usuário
            renderPokemons(userPokemonsDetailed);
        });
    }
}

function showEmptyState() {
    const grid = document.getElementById('pokemon-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Pokémon found</h3>
                <p style="color: var(--text-secondary);">There are no Pokémon matching these filters in your Pokédex.</p>
            </div>
        `;
    }
}

function showGlobalEmptyState() {
    const grid = document.getElementById('pokemon-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--card-bg); border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid var(--border-color);">
                <h3 style="color: var(--text-main); margin-bottom: 0.5rem; font-size: 1.5rem;">Your Pokédex is empty!</h3>
                <p style="color: var(--text-muted);">Go to the shop and complete a checkout to catch some Pokémon.</p>
                <a href="index.html" class="btn-buy" style="display: inline-block; margin-top: 1.5rem; text-decoration: none; width: auto; padding: 0.8rem 2.5rem;">Go to Shop</a>
            </div>
        `;
    }
}

// Renderiza os cards nativamente sem o botão de Buy
function renderPokemons(list) {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';

    if (list.length === 0) {
        showEmptyState();
        return;
    }

    list.forEach(poke => {
        const typesHTML = poke.types.map(t => {
            const typeNameCap = t.charAt(0).toUpperCase() + t.slice(1);
            return `
                <span class="type-badge type-${t}">
                    <img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${t}" class="type-icon">
                    ${t}
                </span>
            `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-testid', `pokedex-card-${poke.name}`);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        card.innerHTML = `
            <img src="${poke.sprite}" alt="${poke.name}">
            <span class="pokemon-id">Nº${poke.id}</span>
            <h3 data-testid="pokemon-name" style="margin-bottom: 1rem; text-transform: capitalize;">${poke.name}</h3>
            <div class="types-container" style="margin-bottom: 0;">${typesHTML}</div>
        `;
        grid.appendChild(card);

        card.addEventListener('click', () => openPokemonDetails(poke.id));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPokemonDetails(poke.id);
            }
        });
    });
}