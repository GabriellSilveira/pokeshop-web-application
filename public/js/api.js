import { allPokemons, offset, limit, setOffset, currentSearchTerm, setCurrentSearchTerm } from './state.js';
import { buy } from './cart.js';

// --- FETCH POKÉMONS WITH PAGINATION (OPTIMIZED) ---
export async function fetchPokemons() {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        
        // 1. Cria um array de "promessas" (requisições disparadas simultaneamente)
        const detailPromises = data.results.map(pokemon => 
            fetch(pokemon.url).then(res => res.json())
        );
        
        // 2. Espera todas terminarem juntas
        const pokemonDetails = await Promise.all(detailPromises);
        
        // 3. Monta o objeto final
        const newPokemons = pokemonDetails.map(pokeDetails => {
            // Soma todos os status e divide por 6 (média)
            const totalStats = pokeDetails.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
            const averageStat = Math.round(totalStats / pokeDetails.stats.length);

            return {
                name: pokeDetails.name,
                id: pokeDetails.id,
                sprite: pokeDetails.sprites.front_default,
                price: averageStat, // O preço agora recebe a média
                types: pokeDetails.types.map(t => t.type.name)
            };
        });

        allPokemons.push(...newPokemons);
        
        setOffset(offset + limit);
        applyFilterAndRender();

    } catch (error) {
        console.error('Error fetching Pokémon from API:', error);
    }
}

export function configureLoadMore() {
    const btnLoadMore = document.getElementById('btnLoadMore');
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            fetchPokemons();
        });
    }
}

export function applyFilterAndRender() {
    if (currentSearchTerm) {
        const filtered = allPokemons.filter(poke => poke.name.toLowerCase().includes(currentSearchTerm));
        renderPokemons(filtered);
    } else {
        renderPokemons(allPokemons);
    }
}

export function renderPokemons(pokemonsToRender) {
    const grid = document.getElementById('pokemon-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (pokemonsToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">No Pokémon found.</p>';
        return;
    }

    pokemonsToRender.forEach(poke => {
        // --- ATUALIZADO: Inserindo o ícone PNG nos badges do Card ---
        const typesHTML = poke.types.map(t => {
            const typeNameCap = t.charAt(0).toUpperCase() + t.slice(1);
            return `<span class="type-badge type-${t}">
                <img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${t}" class="type-icon">
                ${t}
            </span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-testid', `pokemon-card-${poke.name}`);
        card.style.cursor = 'pointer'; // Deixa o cursor em formato de clique
        
        card.innerHTML = `
            <img src="${poke.sprite}" alt="${poke.name}">
            <span class="pokemon-id">Nº${poke.id}</span>
            <h3 data-testid="pokemon-name">${poke.name}</h3>
            <div class="types-container">${typesHTML}</div>
            <p class="price" data-testid="pokemon-price">$ ${poke.price}.00</p>
            <button class="btn-buy" data-testid="buy-button" id="buy-btn-${poke.id}">Buy</button>
        `;
        
        grid.appendChild(card);
        
        // Clique no card carrega os detalhes na direita
        card.addEventListener('click', () => {
            loadFeaturedPokemonDetails(poke.id);
        });

        // Evita que o clique no botão "Buy" selecione o card
        const buyBtn = card.querySelector(`#buy-btn-${poke.id}`);
        buyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o evento suba para o card pai
            buy(poke.name, poke.price, poke.sprite);
        });
    });
}

export function configureSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        setCurrentSearchTerm(term);
        
        clearTimeout(searchTimeout);

        if (!currentSearchTerm) {
            applyFilterAndRender();
            return;
        }

        const localFiltered = allPokemons.filter(poke => poke.name.includes(currentSearchTerm));

        if (localFiltered.length > 0) {
            renderPokemons(localFiltered);
        } else {
            searchTimeout = setTimeout(async () => {
                await fetchPokemonByNameOrId(currentSearchTerm);
            }, 400);
        }
    });
}

export async function fetchPokemonByNameOrId(searchTerm) {
    try {
        const grid = document.getElementById('pokemon-grid');
        if (grid) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">Searching Pokémon in the PokeAPI...</p>';
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        
        if (!response.ok) {
            renderPokemons([]);
            return;
        }

        const pokeDetails = await response.json();
        const types = pokeDetails.types.map(t => t.type.name);

        // Calcula a média para a pesquisa
        const totalStats = pokeDetails.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
        const averageStat = Math.round(totalStats / pokeDetails.stats.length);

        const searchedPokemon = {
            name: pokeDetails.name,
            id: pokeDetails.id,
            sprite: pokeDetails.sprites.front_default,
            price: averageStat, // Atualizado
            types: types
        };

        const exists = allPokemons.some(p => p.name === searchedPokemon.name);
        if (!exists) {
            allPokemons.unshift(searchedPokemon);
        }

        renderPokemons([searchedPokemon]);

    } catch (error) {
        console.error('Error searching specific Pokémon:', error);
        renderPokemons([]);
    }
}

// --- FUNÇÃO COMPARTILHADA: Carrega os detalhes no painel direito ---
export async function loadFeaturedPokemonDetails(identifier) {
    try {
        const [resPoke, resSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${identifier}`)
        ]);

        const poke = await resPoke.json();
        const species = await resSpecies.json();

        const englishFlavorEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
        const description = englishFlavorEntry ? englishFlavorEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';

        document.getElementById('feat-img').src = poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default;
        document.getElementById('feat-id').innerText = `#${String(poke.id).padStart(3, '0')}`;
        document.getElementById('feat-name').innerText = poke.name;
        document.getElementById('feat-description').innerText = description;
        document.getElementById('feat-height').innerText = `${poke.height / 10}m`;
        document.getElementById('feat-weight').innerText = `${poke.weight / 10}kg`;
        document.getElementById('feat-base-exp').innerText = poke.base_experience;
        
        const totalStatsValue = poke.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
        const pokePrice = Math.round(totalStatsValue / poke.stats.length);
        
        const pokeSprite = poke.sprites.front_default;
        const featPrice = document.getElementById('feat-price');
        if (featPrice) featPrice.innerText = `$ ${pokePrice}.00`;
        
        const featBuyBtn = document.getElementById('feat-buy-btn');
        if (featBuyBtn) {
            featBuyBtn.onclick = () => buy(poke.name, pokePrice, pokeSprite);
        }

        const typesContainer = document.getElementById('feat-types');
        if (typesContainer) {
            // --- ATUALIZADO: Inserindo o ícone PNG nos badges do Painel Lateral (Pokedéx) ---
            typesContainer.innerHTML = poke.types.map(t => {
                const typeName = t.type.name;
                const typeNameCap = typeName.charAt(0).toUpperCase() + typeName.slice(1);
                return `<span class="type-badge type-${typeName}">
                    <img src="./img/types/Pokemon_Type_Icon_${typeNameCap}.png" alt="${typeName}" class="type-icon">
                    ${typeName}
                </span>`;
            }).join('');
        }

        const abilitiesContainer = document.getElementById('feat-abilities');
        if (abilitiesContainer) {
            abilitiesContainer.innerHTML = poke.abilities
                .filter(ability => !ability.is_hidden)
                .map(ability => {
                const abilityName = ability.ability.name
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return `
                    <div class="ability-pill" title="Ability">
                        <span>${abilityName}</span>
                    </div>
                `;
                }).join('');
        }

        const statConfig = {
            'hp': { label: 'HP', class: 'stat-hp' },
            'attack': { label: 'ATK', class: 'stat-atk' },
            'defense': { label: 'DEF', class: 'stat-def' },
            'special-attack': { label: 'SpA', class: 'stat-spa' },
            'special-defense': { label: 'SpD', class: 'stat-spd' },
            'speed': { label: 'SPD', class: 'stat-speed' }
        };

        let totalStats = 0;
        let statsHTML = '';

        poke.stats.forEach(s => {
            const config = statConfig[s.stat.name] || { label: s.stat.name.substring(0, 3).toUpperCase(), class: 'stat-hp' };
            totalStats += s.base_stat;
            statsHTML += `
                <div class="stat-item">
                    <div class="stat-badge ${config.class}">${config.label}</div>
                    <span class="stat-value">${s.base_stat}</span>
                </div>
            `;
        });

        statsHTML += `
            <div class="stat-item" style="background: #eef2ff;">
                <div class="stat-badge stat-tot">TOT</div>
                <span class="stat-value" style="color: #4f46e5;">${totalStats}</span>
            </div>
        `;

        const featStats = document.getElementById('feat-stats');
        if (featStats) {
            featStats.innerHTML = `<div class="feat-stats-grid">${statsHTML}</div>`;
        }

    } catch (error) {
        console.error('Error fetching featured Pokémon details:', error);
    }
}

// --- FETCH RANDOM FEATURED POKÉMON ON LOAD ---
export async function fetchFeaturedPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1;
    await loadFeaturedPokemonDetails(randomId);
}