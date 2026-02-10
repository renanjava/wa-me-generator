const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { fetchProducts } = require('./shopee/shopeeClient');
const { sendToSheets } = require('./sheets/sheetsService');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;
const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET_KEY = process.env.SHOPEE_SECRET_KEY;

if (!APP_ID || !SECRET_KEY) {
    console.error("❌ ERRO: SHOPEE_APP_ID e SHOPEE_SECRET_KEY são obrigatórios no arquivo .env");
    process.exit(1);
}

app.post('/api/best-sellers', async (req, res) => {
    try {
        const products = await fetchProducts({
            appId: APP_ID,
            secretKey: SECRET_KEY,
            sortType: 1,
            pages: 1,
            limit: 10
        });
        res.json({ data: { productOfferV2: { nodes: products } } });
    } catch (error) {
        console.error('Erro na requisição Shopee:', error.message);
        res.status(500).json({ error: 'Falha ao buscar produtos' });
    }
});

app.post('/api/high-commission', async (req, res) => {
    try {
        const products = await fetchProducts({
            appId: APP_ID,
            secretKey: SECRET_KEY,
            sortType: 2,
            pages: 4,
            limit: 50
        });
        res.json({ data: { productOfferV2: { nodes: products } } });
    } catch (error) {
        console.error('Erro na requisição Shopee:', error.message);
        res.status(500).json({ error: 'Falha ao buscar produtos de alta comissão' });
    }
});

app.post('/api/update-sheets', async (req, res) => {
    try {
        const { products } = req.body;
        const WEBAPP_URL = process.env.GOOGLE_WEBAPP_URL;

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ error: 'Produtos inválidos' });
        }

        const result = await sendToSheets(WEBAPP_URL, products);

        res.json({
            success: true,
            message: 'Planilha atualizada com sucesso!',
            sheetsResponse: result.response
        });
    } catch (error) {
        console.error('Erro ao atualizar planilha:', error.message);
        res.status(500).json({
            error: 'Falha na sincronização direta.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`👉 Certifique-se de preencher o arquivo .env com suas credenciais.`);
});
