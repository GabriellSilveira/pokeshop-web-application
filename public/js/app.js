import { fetchPokemons, fetchFeaturedPokemon, configureSearch, configureLoadMore } from './api.js';
import { configureCartModal } from './cart.js';
import { initFilters } from './filter.js';
import { verifyLoginStatus } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetchPokemons(),
        fetchFeaturedPokemon()
    ]);
    configureCartModal();
    configureSearch();
    configureLoadMore();
    initFilters();
    verifyLoginStatus();
});