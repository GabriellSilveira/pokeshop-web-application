# 🛒 Pokeshop - QA Edition 

This is a web application project of a Pokémon store (Pokeshop) developed for educational purposes. The primary goal of this repository is to serve as an **Application Under Test (AUT)**, built with development best practices to facilitate the creation of robust automated tests using **Playwright**.

## 🎯 Project Objectives
- Practice core Web Development (HTML, CSS, JS, Node.js).
- Implement a modular frontend architecture.
- **Prepare for Automation:** The project was specifically built with unique identifiers (`data-testid`) to ensure stable and reliable E2E tests.

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3 (Variables, Flexbox, Grid) and Modern JavaScript (ESModules).
- **Backend:** Node.js with Express.js.
- **External API:** [PokeAPI](https://pokeapi.co/) for real-time data consumption.
- **Environment:** Optimized for Playwright integration and CI/CD pipelines.

## ✨ Key Features
- [x] Dynamic Pokémon listing with pagination (Load More).
- [x] Real-time search by name or ID.
- [x] Detailed sidebar with stats fetched directly from the API.
- [x] Mock Shopping Cart system with prices calculated based on Pokémon stats.
- [x] Filter system and Light/Dark mode toggle.
- [x] Simulated Login and Registration modals for authentication flow testing.

## 🧪 QA & Automation Focus
This project was structured to make test scripting seamless:
- **Stable Selectors:** Extensive use of `data-testid` attributes on buttons, inputs, and critical areas to prevent layout changes from breaking tests.
- **Predictable State:** Clear logic for modal states (open/closed) and success/error feedback for behavioral validation.
- **CI/CD Ready:** Simplified server configuration to run effortlessly in Continuous Integration environments.

> **Note:** The automated tests for this application are being developed in a **separate repository** to simulate a real-world enterprise CI/CD pipeline scenario.

## 🛠️ Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pokeshop-web-application.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd pokeshop-web-application
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access in your browser:**
   `http://localhost:3000`

---
Developed for learning QA and Test Automation. 🚀
