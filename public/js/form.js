var App = App || {};

App.Form = (function() {
    const FIXED = {
        header: "📢 Itambé/PR Promoções",
        linkGrupo: "https://chat.whatsapp.com/G4cttd3Ykv0IjQH00i3LVo"
    };

    let inputs = {};
    let parcelamentoContainer, messageOutput, priceTag;

    function init() {
        inputs = {
            titulo: document.getElementById('titulo'),
            nomeProduto: document.getElementById('nomeProduto'),
            precoAntigo: document.getElementById('precoAntigo'),
            precoAtual: document.getElementById('precoAtual'),
            parcelasQtd: document.getElementById('parcelasQtd'),
            parcelasValor: document.getElementById('parcelasValor'),
            parcelasSemJuros: document.getElementById('parcelasSemJuros'),
            freteGratis: document.getElementById('freteGratis'),
            comCupom: document.getElementById('comCupom'),
            linkAfiliado: document.getElementById('linkAfiliado')
        };

        parcelamentoContainer = document.getElementById('parcelamentoContainer');
        messageOutput = document.getElementById('messageOutput');
        priceTag = document.getElementById('priceTag');

        Object.values(inputs).forEach(input => input.addEventListener('input', generateMessage));
        generateMessage();
    }

    function resetForm() {
        inputs.titulo.value = '';
        inputs.nomeProduto.value = '';
        inputs.precoAntigo.value = '';
        inputs.precoAtual.value = '';
        inputs.parcelasQtd.value = '';
        inputs.parcelasValor.value = '';
        inputs.parcelasSemJuros.checked = false;
        inputs.freteGratis.checked = false;
        inputs.comCupom.checked = false;
        inputs.linkAfiliado.value = '';
        generateMessage();
    }

    function fillFormWithProduct(product) {
        inputs.titulo.value = "";
        inputs.nomeProduto.value = product.productName;
        inputs.precoAntigo.value = "";
        inputs.precoAtual.value = product.price.toString();
        inputs.linkAfiliado.value = product.offerLink;
        inputs.freteGratis.checked = false;
        inputs.comCupom.checked = false;
        generateMessage();
    }

    function getFormattedText() {
        const rawCurrentPrice = parseFloat(inputs.precoAtual.value.replace(',', '.'));
        const rawOldPrice = parseFloat(inputs.precoAntigo.value.replace(',', '.'));

        if (!isNaN(rawCurrentPrice) && rawCurrentPrice >= 50) {
            parcelamentoContainer.classList.remove('hidden');
        } else {
            parcelamentoContainer.classList.add('hidden');
        }

        if (isNaN(rawCurrentPrice)) {
            return { wa: null, ig: null, valid: false };
        }

        const data = {
            titulo: inputs.titulo.value.trim(),
            nomeProduto: inputs.nomeProduto.value.trim() || '{PRODUTO}',
            precoAntigoStr: (!isNaN(rawOldPrice) && rawOldPrice > 0) ? rawOldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : null,
            precoAtualStr: rawCurrentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            frete: inputs.freteGratis.checked ? '🚚 Frete Grátis' : null,
            cupom: inputs.comCupom.checked ? '🎟️ Com cupom' : null,
            link: inputs.linkAfiliado.value.trim() || '{LINK}'
        };

        let parcelamentoStr = null;
        if (rawCurrentPrice >= 50) {
            const qtd = inputs.parcelasQtd.value;
            const valor = inputs.parcelasValor.value;
            const semJuros = inputs.parcelasSemJuros.checked;
            if (qtd && valor) {
                const formattedValor = parseFloat(valor.toString().replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                parcelamentoStr = `💳 ${qtd}x de R$ ${formattedValor}${semJuros ? ' sem juros' : ''}`;
            }
        }

        let category = "MÉDIO";
        if (rawCurrentPrice < 30) { category = "BARATO"; }
        else if (rawCurrentPrice >= 150 && rawCurrentPrice <= 500) { category = "CARO"; }
        else if (rawCurrentPrice > 500) { category = "MUITO CARO"; }

        const msgLinesWA = [FIXED.header, ``];
        if (data.titulo) {
            msgLinesWA.push(`👉 *${data.titulo}*`);
            msgLinesWA.push(``);
        }
        msgLinesWA.push(`📦 *${data.nomeProduto}*`);
        msgLinesWA.push(``);
        if (data.precoAntigoStr) msgLinesWA.push(`~💰 De R$ ${data.precoAntigoStr}~`);
        msgLinesWA.push(`💰 Por *R$ ${data.precoAtualStr}*`);
        if (parcelamentoStr) msgLinesWA.push(parcelamentoStr);
        if (data.frete) msgLinesWA.push(data.frete);
        if (data.cupom) msgLinesWA.push(data.cupom);
        msgLinesWA.push(``, `🛒 Comprar agora:`, data.link, ``, `✅ Grupo no WhatsApp com as ofertas:`, FIXED.linkGrupo);

        const msgLinesIG = [];
        msgLinesIG.push(`🔥 Por R$ ${data.precoAtualStr}`);
        msgLinesIG.push(``, `🛒 Comprar agora:`, data.link);
        msgLinesIG.push(``, `✅ Grupo no WhatsApp:`, FIXED.linkGrupo);

        return {
            wa: msgLinesWA.filter(l => l !== null).join('\n'),
            ig: msgLinesIG.filter(l => l !== null).join('\n'),
            category,
            data,
            valid: true
        };
    }

    function generateMessage() {
        const result = getFormattedText();
        if (!result.valid) {
            if (messageOutput) messageOutput.textContent = 'Aguardando preço do produto...';
            if (priceTag) priceTag.textContent = 'Aguardando preço...';
            return;
        }
        if (messageOutput) messageOutput.textContent = result.wa;
        if (priceTag) priceTag.textContent = result.category;
    }

    return { init, resetForm, fillFormWithProduct, getFormattedText, generateMessage };
})();
