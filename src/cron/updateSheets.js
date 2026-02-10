const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { fetchProducts } = require('../shopee/shopeeClient');
const { sendToSheets } = require('../sheets/sheetsService');

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

async function main() {
    console.log('🚀 Iniciando atualização automática da planilha...');
    console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('');

    try {
        console.log('🔍 Buscando produtos de alta comissão...');
        const products = await fetchProducts({
            appId: APP_ID,
            secretKey: SECRET_KEY,
            sortType: 2,
            pages: 4,
            limit: 50
        });
        console.log(`📦 Total de produtos encontrados: ${products.length}`);
        console.log('');

        console.log('📊 Atualizando Google Sheets...');
        const result = await sendToSheets(WEBAPP_URL, products);
        console.log(`✅ Planilha atualizada com sucesso! ${result.rows} produtos enviados.`);
        console.log('');

        console.log('🎉 Processo concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('💥 Erro fatal durante a execução:', error.message);
        process.exit(1);
    }
}

main();
