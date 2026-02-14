import type { Product, FormInputs, FormResult } from './types';

export const Form = (function () {
    let inputs: FormInputs = {
        nomeProduto: null,
        precoAtual: null,
        linkAfiliado: null
    };

    function init(): void {
        inputs = {
            nomeProduto: document.getElementById('nomeProduto') as HTMLInputElement | null,
            precoAtual: document.getElementById('precoAtual') as HTMLInputElement | null,
            linkAfiliado: document.getElementById('linkAfiliado') as HTMLInputElement | null
        };
    }

    function fillFormWithProduct(product: Product): void {
        if (inputs.nomeProduto) inputs.nomeProduto.value = product.productName || '';
        if (inputs.precoAtual) inputs.precoAtual.value = product.price ? product.price.toString() : '';
        if (inputs.linkAfiliado) inputs.linkAfiliado.value = product.offerLink || '';
    }

    function getFormattedText(): FormResult {
        const name: string = inputs.nomeProduto ? inputs.nomeProduto.value.trim() : '';
        const rawPrice: number = inputs.precoAtual ? parseFloat(inputs.precoAtual.value.replace(',', '.')) : NaN;
        const link: string = inputs.linkAfiliado ? inputs.linkAfiliado.value.trim() : '';

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
