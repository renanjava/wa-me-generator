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

app.post('/api/high-commission', async (req, res) => {
    try {
        const allProducts = [];
        const query = `query MaiorComissao($limite:Int,$pagina:Int){productOfferV2(limit:$limite,page:$pagina,sortType:2,listType:0){nodes{productName productLink offerLink price commission commissionRate imageUrl shopName}}}`;
        
        for (let page = 0; page < 4; page++) {
            const timestamp = Math.floor(Date.now() / 1000);
            const variables = { limite: 50, pagina: page };
            const bodyContent = JSON.stringify({ query, variables });
            const factor = APP_ID + timestamp + bodyContent + SECRET_KEY;
            const signature = CryptoJS.SHA256(factor).toString();
            
            const response = await axios.post('https://open-api.affiliate.shopee.com.br/graphql', bodyContent, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `SHA256 Credential=${APP_ID},Timestamp=${timestamp},Signature=${signature}`
                }
            });
            
            if (response.data?.data?.productOfferV2?.nodes) {
                allProducts.push(...response.data.data.productOfferV2.nodes);
            }
            
            if (page < 3) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        res.json({ data: { productOfferV2: { nodes: allProducts } } });
    } catch (error) {
        console.error('Erro na requisição Shopee:', error.response ? error.response.data : error.message);
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

        if (!WEBAPP_URL) {
            return res.status(400).json({ error: 'URL do Google Web App não configurada no .env' });
        }

        const rows = products.map((product) => [
            product.productName || '',
            product.offerLink || '',
            parseFloat(product.price) || 0,
            product.imageUrl || ''
        ]);

        // Envia os dados. O Apps Script exige seguir redirecionamentos (maxRedirects).
        const response = await axios.post(WEBAPP_URL, { rows }, {
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Aceita redirecionamentos
            }
        });

        // Se o Google retornar um erro dentro do JSON de sucesso
        if (response.data && response.data.result === 'error') {
            throw new Error('Erro no Google Script: ' + response.data.error);
        }

        res.json({ 
            success: true, 
            message: 'Planilha atualizada com sucesso!',
            sheetsResponse: response.data
        });
    } catch (error) {
        console.error('Erro detalhado ao atualizar planilha:', error.response ? error.response.data : error.message);
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
