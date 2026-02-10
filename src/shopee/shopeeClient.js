const axios = require('axios');
const CryptoJS = require('crypto-js');

const SHOPEE_API_URL = 'https://open-api.affiliate.shopee.com.br/graphql';

const PRODUCT_FIELDS = 'productName productLink offerLink price commission commissionRate imageUrl shopName';

function createSignature(appId, secretKey, timestamp, body) {
    const factor = appId + timestamp + body + secretKey;
    return CryptoJS.SHA256(factor).toString();
}

function buildAuthHeader(appId, secretKey, body) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createSignature(appId, secretKey, timestamp, body);
    return {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`
    };
}

async function fetchProducts({ appId, secretKey, sortType = 2, pages = 1, limit = 50 }) {
    const allProducts = [];

    const query = `query ProductQuery($limite:Int,$pagina:Int){productOfferV2(limit:$limite,page:$pagina,sortType:${sortType},listType:0){nodes{${PRODUCT_FIELDS}}}}`;

    for (let page = 0; page < pages; page++) {
        const variables = { limite: limit, pagina: page };
        const bodyContent = JSON.stringify({ query, variables });
        const headers = buildAuthHeader(appId, secretKey, bodyContent);

        const response = await axios.post(SHOPEE_API_URL, bodyContent, { headers });

        if (response.data?.data?.productOfferV2?.nodes) {
            allProducts.push(...response.data.data.productOfferV2.nodes);
        }

        if (page < pages - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return allProducts;
}

module.exports = { fetchProducts, createSignature, buildAuthHeader };
