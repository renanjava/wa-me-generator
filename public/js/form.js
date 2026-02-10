export const Form = (function() {
    let inputs = {};

    function init() {
        inputs = {
            nomeProduto: document.getElementById('nomeProduto'),
            precoAtual: document.getElementById('precoAtual'),
            linkAfiliado: document.getElementById('linkAfiliado')
        };
    }

    function fillFormWithProduct(product) {
        if (inputs.nomeProduto) inputs.nomeProduto.value = product.productName || '';
        if (inputs.precoAtual) inputs.precoAtual.value = product.price ? product.price.toString() : '';
        if (inputs.linkAfiliado) inputs.linkAfiliado.value = product.offerLink || '';
    }

    function getFormattedText() {
        var name = inputs.nomeProduto ? inputs.nomeProduto.value.trim() : '';
        var rawPrice = inputs.precoAtual ? parseFloat(inputs.precoAtual.value.replace(',', '.')) : NaN;
        var link = inputs.linkAfiliado ? inputs.linkAfiliado.value.trim() : '';

        if (isNaN(rawPrice) || !name) {
            return { valid: false };
        }

        return {
            valid: true,
            data: {
                nomeProduto: name,
                precoAtualStr: rawPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                link: link
            }
        };
    }

    return { init, fillFormWithProduct, getFormattedText };
})();
