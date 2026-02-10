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

async function sendToSheets(webappUrl, products, meta) {
    if (!webappUrl) {
        throw new Error('URL do Google Web App não configurada');
    }

    const rows = formatProductRows(products);

    const payload = { rows };
    if (meta) {
        payload.meta = meta;
    }

    const response = await axios.post(webappUrl, payload, {
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

async function readFromSheets(webappUrl) {
    if (!webappUrl) {
        throw new Error('URL do Google Web App não configurada');
    }

    const response = await axios.get(webappUrl, {
        maxRedirects: 5,
        validateStatus: function (status) {
            return status >= 200 && status < 400;
        }
    });

    return response.data;
}

module.exports = { formatProductRows, sendToSheets, readFromSheets };
