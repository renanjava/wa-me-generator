require('dotenv').config();
const axios = require('axios');
const CryptoJS = require('crypto-js');

const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET_KEY = process.env.SHOPEE_SECRET_KEY;
const WEBAPP_URL = process.env.GOOGLE_WEBAPP_URL;

if (!APP_ID || !SECRET_KEY) {
    console.error("❌ ERRO: SHOPEE_APP_ID e SHOPEE_SECRET_KEY são obrigatórios");
    process.exit(1);
}

if (!WEBAPP_URL) {
    console.error("❌ ERRO: GOOGLE_WEBAPP_URL é obrigatório");
    process.exit(1);
}

async function fetchHighCommissionProducts() {
    console.log('🔍 Buscando produtos de alta comissão...');
    
    const allProducts = [];
    const query = `query MaiorComissao($limite:Int,$pagina:Int){productOfferV2(limit:$limite,page:$pagina,sortType:2,listType:0){nodes{productName productLink offerLink price commission commissionRate imageUrl shopName}}}`;
    
    for (let page = 0; page < 4; page++) {
        const timestamp = Math.floor(Date.now() / 1000);
        const variables = { limite: 50, pagina: page };
        const bodyContent = JSON.stringify({ query, variables });
        const factor = APP_ID + timestamp + bodyContent + SECRET_KEY;
        const signature = CryptoJS.SHA256(factor).toString();
        
        try {
            const response = await axios.post('https://open-api.affiliate.shopee.com.br/graphql', bodyContent, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `SHA256 Credential=${APP_ID},Timestamp=${timestamp},Signature=${signature}`
                }
            });
            
            if (response.data?.data?.productOfferV2?.nodes) {
                allProducts.push(...response.data.data.productOfferV2.nodes);
                console.log(`✅ Página ${page + 1}/4 - ${response.data.data.productOfferV2.nodes.length} produtos encontrados`);
            }
            
            // Aguarda 500ms entre requisições para evitar rate limiting
            if (page < 3) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar página ${page + 1}:`, error.response ? error.response.data : error.message);
            throw error;
        }
    }
    
    console.log(`📦 Total de produtos encontrados: ${allProducts.length}`);
    return allProducts;
}

async function updateGoogleSheets(products) {
    console.log('📊 Atualizando Google Sheets...');
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new Error('Nenhum produto para atualizar');
    }

    const rows = products.map((product) => [
        product.productName || '',
        product.offerLink || '',
        parseFloat(product.price) || 0,
        product.imageUrl || ''
    ]);

    try {
        const response = await axios.post(WEBAPP_URL, { rows }, {
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        if (response.data && response.data.result === 'error') {
            throw new Error('Erro no Google Script: ' + response.data.error);
        }

        console.log('✅ Planilha atualizada com sucesso!');
        console.log(`📝 ${rows.length} produtos enviados para o Google Sheets`);
        
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao atualizar planilha:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function main() {
    console.log('🚀 Iniciando atualização automática da planilha...');
    console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('');
    
    try {
        // Passo 1: Buscar produtos de alta comissão
        const products = await fetchHighCommissionProducts();
        
        console.log('');
        
        // Passo 2: Atualizar Google Sheets
        await updateGoogleSheets(products);
        
        console.log('');
        console.log('🎉 Processo concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('💥 Erro fatal durante a execução:', error.message);
        process.exit(1);
    }
}

// Executa o script
main();
