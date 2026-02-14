import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { fetchProducts } from '../shopee/shopeeClient';
import { sendToSheets } from '../sheets/sheetsService';

const APP_ID: string | undefined = process.env.SHOPEE_APP_ID;
const SECRET_KEY: string | undefined = process.env.SHOPEE_SECRET_KEY;
const WEBAPP_URL: string | undefined = process.env.GOOGLE_WEBAPP_URL;

if (!APP_ID || !SECRET_KEY) {
    console.error("❌ ERRO: SHOPEE_APP_ID e SHOPEE_SECRET_KEY são obrigatórios");
    process.exit(1);
}

if (!WEBAPP_URL) {
    console.error("❌ ERRO: GOOGLE_WEBAPP_URL é obrigatório");
    process.exit(1);
}

async function main(): Promise<void> {
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
    } catch (error: unknown) {
        console.error('');
        console.error('💥 Erro fatal durante a execução:', (error as Error).message);
        process.exit(1);
    }
}

main();
