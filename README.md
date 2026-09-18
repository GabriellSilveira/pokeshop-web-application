# ⚡ PokéShop - My Pokédex & E-Commerce

> A modern, responsive web application for browsing and purchasing Pokémon, powered by the [PokéAPI](https://pokeapi.co/).

---

## 🚀 Features

- **🛒 Pokémon E-Commerce:** Browse Pokémon cards with prices generated from base experience and add items directly to your cart.
- **🔍 Smart Search Bar:** Instant client-side filtering with an automatic fallback to query PokéAPI directly if the Pokémon isn't loaded locally yet.
- **📊 Interactive Sidebar:** Click any card in the grid to display its detailed stats (HP, ATK, DEF, TOT), types, dimensions, and official Pokédex description in the right-side panel.
- **🍞 Theme-Aware Toast Notifications:** Custom pill-shaped popups featuring the exact pixel-art sprite of the added Pokémon.
- **🌙 Dark / Light Mode Toggle:** Full dark theme support across all elements, saving user preference in `localStorage`.
- **📄 Dynamic Pagination:** Progressively load more Pokémon on demand using the *Load More* button.
- **🛍️ Cart & Checkout:** Manage cart items, remove individual Pokémon, and view automated total price calculation.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic and accessible structure.
- **CSS3:** Modular stylesheets powered by CSS variables for seamless theme switching.
- **JavaScript (ES6 Modules):** Clean, maintainable architecture using standard `import`/`export` patterns.
- **PokéAPI:** Public REST API for Pokémon data, sprites, and official artwork.

---

## 📂 Project Structure

```text
pokeshop/
├── index.html          # Main shop page
├── pokedex.html        # Personal collection page
├── css/
│   ├── style.css       # Central stylesheet imports
│   ├── global.css      # Theme variables (Dark/Light mode)
│   ├── theme.css       # Theme toggle styling & dark mode overrides
│   ├── navbar.css      # Navigation bar styling
│   ├── search.css      # Search bar styling
│   ├── catalog.css     # Grid card styling
│   ├── sidebar.css     # Featured panel & stats layout
│   ├── toast.css       # Floating notification pill styles
│   └── auth.css        # Modals for login and cart
└── js/
    ├── app.js          # Entry point and initialization
    ├── api.js          # PokéAPI fetching, pagination, and grid rendering
    ├── cart.js         # Cart logic, checkout, and item removal
    ├── state.js        # Centralized global state management
    ├── theme.js        # Dark mode toggle handling
    └── toast.js        # Toast notification component
