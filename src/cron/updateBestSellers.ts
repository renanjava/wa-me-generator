import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import { fetchProducts } from '../shopee/shopeeClient';
import { sendToSheets } from '../sheets/sheetsService';
import type { SheetMeta } from '../types';

const APP_ID: string | undefined = process.env.SHOPEE_APP_ID;
const SECRET_KEY: string | undefined = process.env.SHOPEE_SECRET_KEY;
const WEBAPP_URL: string | undefined = process.env.VITE_GOOGLE_WEBAPP_URL_BESTSELLERS;

if (!APP_ID || !SECRET_KEY) {
    console.error("❌ ERRO: SHOPEE_APP_ID e SHOPEE_SECRET_KEY são obrigatórios");
    process.exit(1);
}

if (!WEBAPP_URL) {
    console.error("❌ ERRO: VITE_GOOGLE_WEBAPP_URL_BESTSELLERS é obrigatório");
    process.exit(1);
}

async function main(): Promise<void> {
    console.log('🚀 Iniciando busca de mais vendidos...');
    console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log('');

    try {
        console.log('🔍 Buscando 25 mais vendidos...');
        const products = await fetchProducts({
            appId: APP_ID,
            secretKey: SECRET_KEY,
            sortType: 1,
            pages: 1,
            limit: 25
        });
        console.log(`📦 Total de produtos encontrados: ${products.length}`);
        console.log('');

        console.log('📊 Atualizando Google Sheets...');
        const meta: SheetMeta = {
            count: products.length,
            lastUpdate: new Date().toISOString()
        };
        const result = await sendToSheets(WEBAPP_URL, products, meta);
        console.log(`✅ Planilha atualizada! ${result.rows} produtos + meta enviados.`);
        console.log('');

        console.log('🎉 Processo concluído com sucesso!');
        process.exit(0);
    } catch (error: unknown) {
        console.error('');
        console.error('💥 Erro fatal:', (error as Error).message);
        process.exit(1);
    }
}

main();
