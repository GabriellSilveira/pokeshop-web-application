import { setAllPokemons, setOffset } from './state.js';
import { renderPokemons, fetchPokemons } from './api.js';

let activeTypes = [];
let activeGenerationUrl = null;
let activeGenerationName = null;

export async function initFilters() {
    const container = document.createElement('div');
    container.className = 'filters-container';
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

    // Container para as TAGS ativas
    const activeContainer = document.createElement('div');
    activeContainer.id = 'active-filters';
    activeContainer.className = 'active-filters-container';

    // Container para a mensagem amigável de erro (substitui o alert do navegador)
    const warningContainer = document.createElement('div');
    warningContainer.id = 'filter-warning';
    warningContainer.className = 'filter-warning-msg hidden';
    warningContainer.innerText = '⚠️ A Pokémon can have at most 2 types.';

    const searchContainer = document.querySelector('.search-container') || document.querySelector('main');
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
            
            item.innerHTML = `
                <img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${t.name}" class="type-icon">
                ${t.name}
            `;
            
            item.addEventListener('click', () => {
                toggleTypeFilter(t.name);
                // Fecha o menu de tipos imediatamente após selecionar
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
                // Fecha o menu de gerações imediatamente após selecionar
                genMenu.classList.add('hidden');
            });
            genMenu.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

// Controla a exibição da mensagem de aviso amigável
function showWarning(show) {
    const warningEl = document.getElementById('filter-warning');
    if (!warningEl) return;
    if (show) {
        warningEl.classList.remove('hidden');
    } else {
        warningEl.classList.add('hidden');
    }
}

function toggleTypeFilter(typeName) {
    // Esconde o aviso anterior sempre que interagir
    showWarning(false);

    if (activeTypes.includes(typeName)) {
        activeTypes = activeTypes.filter(t => t !== typeName);
    } else {
        if (activeTypes.length >= 2) {
            showWarning(true); // Exibe a mensagem bonita em vez do alert
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

async function applyCombinedFilters() {
    renderActiveFiltersUI();

    if (activeTypes.length === 0 && !activeGenerationUrl) {
        resetToDefault();
        return;
    }

    showLoadingState();
    showResetButton(true);

    try {
        let candidatePokemonNames = null;

        if (activeGenerationUrl) {
            const genRes = await fetch(activeGenerationUrl);
            const genData = await genRes.json();
            candidatePokemonNames = new Set(genData.pokemon_species.map(s => s.name));
        }

        if (activeTypes.length > 0) {
            const typePromises = activeTypes.map(type => 
                fetch(`https://pokeapi.co/api/v2/type/${type}`).then(res => res.json())
            );
            const typeResults = await Promise.all(typePromises);
            
            let typeMatchedNames = new Set(typeResults[0].pokemon.map(p => p.pokemon.name));

            for (let i = 1; i < typeResults.length; i++) {
                const currentTypeNames = new Set(typeResults[i].pokemon.map(p => p.pokemon.name));
                typeMatchedNames = new Set([...typeMatchedNames].filter(name => currentTypeNames.has(name)));
            }

            if (candidatePokemonNames) {
                candidatePokemonNames = new Set([...candidatePokemonNames].filter(name => typeMatchedNames.has(name)));
            } else {
                candidatePokemonNames = typeMatchedNames;
            }
        }

        const finalNamesList = Array.from(candidatePokemonNames || []);

        if (finalNamesList.length === 0) {
            setAllPokemons([]);
            showEmptyState();
            return;
        }

        const limitedNames = finalNamesList.slice(0, 36);

        const detailPromises = limitedNames.map(name => 
            fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json())
        );
        const pokemonDetails = await Promise.all(detailPromises);

        const detailedPokemons = pokemonDetails.map(pokeDetails => {
            const totalStats = pokeDetails.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
            const averageStat = Math.round(totalStats / pokeDetails.stats.length);

            return {
                name: pokeDetails.name,
                id: pokeDetails.id,
                sprite: pokeDetails.sprites.front_default,
                price: averageStat,
                types: pokeDetails.types.map(t => t.type.name)
            };
        });

        detailedPokemons.sort((a, b) => a.id - b.id);

        setAllPokemons(detailedPokemons);
        renderPokemons(detailedPokemons);

    } catch (error) {
        console.error('Error applying combined filters:', error);
        renderPokemons([]);
    }
}

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
    if (grid) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">Filtering Pokémon...</p>';
    }
}

function showResetButton(show) {
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        if (show) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
    }
}

function resetToDefault() {
    activeTypes = [];
    activeGenerationUrl = null;
    activeGenerationName = null;
    showWarning(false);
    renderActiveFiltersUI();
    setAllPokemons([]);
    setOffset(0);
    showResetButton(false);
    fetchPokemons();
}

function setupResetButton() {
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefault);
    }
}

function showEmptyState() {
    const grid = document.getElementById('pokemon-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Pokémon found</h3>
                <p style="color: var(--text-secondary);">There are no Pokémon matching this exact combination of Generation and Types.</p>
            </div>
        `;
    }
}