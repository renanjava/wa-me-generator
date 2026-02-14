import axios, { type AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import type { Product, FetchProductsOptions } from '../types';

const SHOPEE_API_URL: string = 'https://open-api.affiliate.shopee.com.br/graphql';

const PRODUCT_FIELDS: string = 'productName productLink offerLink price commission commissionRate imageUrl shopName';

interface ShopeeGraphQLResponse {
    data?: {
        productOfferV2?: {
            nodes?: Product[];
        };
    };
}

function createSignature(appId: string, secretKey: string, timestamp: number, body: string): string {
    const factor: string = appId + timestamp + body + secretKey;
    return CryptoJS.SHA256(factor).toString();
}

function buildAuthHeader(appId: string, secretKey: string, body: string): Record<string, string> {
    const timestamp: number = Math.floor(Date.now() / 1000);
    const signature: string = createSignature(appId, secretKey, timestamp, body);
    return {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`
    };
}

async function fetchProducts({ appId, secretKey, sortType = 2, pages = 1, limit = 50 }: FetchProductsOptions): Promise<Product[]> {
    const allProducts: Product[] = [];

    const query: string = `query ProductQuery($limite:Int,$pagina:Int){productOfferV2(limit:$limite,page:$pagina,sortType:${sortType},listType:0){nodes{${PRODUCT_FIELDS}}}}`;

    for (let page: number = 0; page < pages; page++) {
        const variables: { limite: number; pagina: number } = { limite: limit, pagina: page };
        const bodyContent: string = JSON.stringify({ query, variables });
        const headers: Record<string, string> = buildAuthHeader(appId, secretKey, bodyContent);

        const response: AxiosResponse<ShopeeGraphQLResponse> = await axios.post(SHOPEE_API_URL, bodyContent, { headers });

        if (response.data?.data?.productOfferV2?.nodes) {
            allProducts.push(...response.data.data.productOfferV2.nodes);
        }

        if (page < pages - 1) {
            await new Promise<void>(resolve => setTimeout(resolve, 500));
        }
    }

    return allProducts;
}

export { fetchProducts, createSignature, buildAuthHeader };
