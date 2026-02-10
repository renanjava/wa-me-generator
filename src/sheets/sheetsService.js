const axios = require('axios');

function formatProductRows(products) {
    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new Error('Nenhum produto para formatar');
    }

    return products.map((product) => [
        product.productName || '',
        product.offerLink || '',
        parseFloat(product.price) || 0,
        product.imageUrl || ''
    ]);
}

async function sendToSheets(webappUrl, products) {
    if (!webappUrl) {
        throw new Error('URL do Google Web App não configurada');
    }

    const rows = formatProductRows(products);

    const response = await axios.post(webappUrl, { rows }, {
        maxRedirects: 5,
        validateStatus: function (status) {
            return status >= 200 && status < 400;
        }
    });

    if (response.data && response.data.result === 'error') {
        throw new Error('Erro no Google Script: ' + response.data.error);
    }

    return { rows: rows.length, response: response.data };
}

module.exports = { formatProductRows, sendToSheets };
