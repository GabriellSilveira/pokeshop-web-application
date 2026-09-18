const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pokedex.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pokedex.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.use(express.json());

app.listen(port, () => {
    console.log(`Pokeshop rodando com sucesso em http://localhost:${port}`);
});