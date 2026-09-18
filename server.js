const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
    res.status(200).send('Server is running!');
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Opcional: crie um 404.html depois
});

app.listen(port, () => {
    console.log(`Pokeshop rodando em http://localhost:${port}`);
});