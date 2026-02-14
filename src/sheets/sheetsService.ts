import axios, { type AxiosResponse } from 'axios';
import type { Product, SheetMeta, SendToSheetsResult } from '../types';

type ProductRow = [string, string, number, string];

function formatProductRows(products: Product[]): ProductRow[] {
    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new Error('Nenhum produto para formatar');
    }

    return products.map((product: Product): ProductRow => [
        product.productName || '',
        product.offerLink || '',
        parseFloat(String(product.price)) || 0,
        product.imageUrl || ''
    ]);
}

interface SheetsPayload {
    rows: ProductRow[];
    meta?: SheetMeta;
}

interface SheetsResponse {
    result?: string;
    error?: string;
}

async function sendToSheets(webappUrl: string, products: Product[], meta?: SheetMeta): Promise<SendToSheetsResult> {
    if (!webappUrl) {
        throw new Error('URL do Google Web App não configurada');
    }

    const rows: ProductRow[] = formatProductRows(products);

    const payload: SheetsPayload = { rows };
    if (meta) {
        payload.meta = meta;
    }

    const response: AxiosResponse<SheetsResponse> = await axios.post(webappUrl, payload, {
        maxRedirects: 5,
        validateStatus: function (status: number): boolean {
            return status >= 200 && status < 400;
        }
    });

    if (response.data && response.data.result === 'error') {
        throw new Error('Erro no Google Script: ' + response.data.error);
    }

    return { rows: rows.length, response: response.data };
}

async function readFromSheets(webappUrl: string): Promise<unknown> {
    if (!webappUrl) {
        throw new Error('URL do Google Web App não configurada');
    }

    const response: AxiosResponse = await axios.get(webappUrl, {
        maxRedirects: 5,
        validateStatus: function (status: number): boolean {
            return status >= 200 && status < 400;
        }
    });

    return response.data;
}

export { formatProductRows, sendToSheets, readFromSheets };
