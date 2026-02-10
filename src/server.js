const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { readFromSheets } = require('./sheets/sheetsService');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
const BESTSELLERS_URL = process.env.GOOGLE_WEBAPP_URL_BESTSELLERS;

app.get('/api/products', async (req, res) => {
    try {
        if (!BESTSELLERS_URL) {
            return res.status(500).json({ error: 'GOOGLE_WEBAPP_URL_BESTSELLERS não configurada' });
        }

        const data = await readFromSheets(BESTSELLERS_URL);
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar produtos da planilha:', error.message);
        res.status(500).json({ error: 'Falha ao carregar produtos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
