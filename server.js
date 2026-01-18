require('dotenv').config();
const express = require('express');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET_KEY = process.env.SHOPEE_SECRET_KEY;

if (!APP_ID || !SECRET_KEY) {
    console.error("❌ ERRO: SHOPEE_APP_ID e SHOPEE_SECRET_KEY são obrigatórios no arquivo .env");
    process.exit(1);
}

app.post('/api/best-sellers', async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const query = `query MaisVendidos($limite:Int,$pagina:Int){productOfferV2(limit:$limite,page:$pagina,sortType:1,listType:0){nodes{productName productLink offerLink price commission commissionRate imageUrl shopName}}}`;
        const variables = { limite: 10, pagina: 0 };
        const bodyContent = JSON.stringify({ query, variables });
        const factor = APP_ID + timestamp + bodyContent + SECRET_KEY;
        const signature = CryptoJS.SHA256(factor).toString();
        const response = await axios.post('https://open-api.affiliate.shopee.com.br/graphql', bodyContent, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `SHA256 Credential=${APP_ID},Timestamp=${timestamp},Signature=${signature}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro na requisição Shopee:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Falha ao buscar produtos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`👉 Certifique-se de preencher o arquivo .env com suas credenciais.`);
});
