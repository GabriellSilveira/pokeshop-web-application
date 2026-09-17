// --- GLOBAL STATE ---
export let cart = [];
export let allPokemons = [];
export let offset = 0;
export const limit = 18;
export let currentSearchTerm = '';

export function setCart(newCart) {
    cart = newCart;
}

export function setAllPokemons(newPokemons) {
    allPokemons = newPokemons;
}

export function setOffset(newOffset) {
    offset = newOffset;
}

export function setCurrentSearchTerm(term) {
    currentSearchTerm = term;
}