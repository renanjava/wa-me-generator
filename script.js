document.addEventListener('DOMContentLoaded', () => {
    // Inputs (Visible)
    const inputs = {
        titulo: document.getElementById('titulo'),
        nomeProduto: document.getElementById('nomeProduto'),
        precoAntigo: document.getElementById('precoAntigo'),
        precoAtual: document.getElementById('precoAtual'),
        parcelasQtd: document.getElementById('parcelasQtd'),
        parcelasValor: document.getElementById('parcelasValor'),
        parcelasSemJuros: document.getElementById('parcelasSemJuros'),
        freteGratis: document.getElementById('freteGratis'),
        linkAfiliado: document.getElementById('linkAfiliado')
    };

    // Fixed Values
    const FIXED = {
        header: "📢 Itambé/PR Promoções",
        linkGrupo: "https://chat.whatsapp.com/GduFGpLaZuv2RDu0SMBT8e"
    };

    const parcelamentoContainer = document.getElementById('parcelamentoContainer');

    // Outputs
    const messageOutput = document.getElementById('messageOutput');
    const priceTag = document.getElementById('priceTag');
    const btnSend = document.getElementById('btnSend');

    const generateMessage = () => {
        const rawCurrentPrice = parseFloat(inputs.precoAtual.value.replace(',', '.'));
        const rawOldPrice = parseFloat(inputs.precoAntigo.value.replace(',', '.'));
        
        if (!isNaN(rawCurrentPrice) && rawCurrentPrice >= 50) {
            parcelamentoContainer.classList.remove('hidden');
        } else {
            parcelamentoContainer.classList.add('hidden');
        }

        if (isNaN(rawCurrentPrice)) {
            messageOutput.textContent = 'Aguardando preço do produto...';
            return;
        }

        const data = {
            titulo: inputs.titulo.value.trim() || '{TITULO}',
            nomeProduto: inputs.nomeProduto.value.trim() || '{PRODUTO}',
            precoAntigoStr: (!isNaN(rawOldPrice) && rawOldPrice > 0) ? rawOldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : null,
            precoAtualStr: rawCurrentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            frete: inputs.freteGratis.checked ? '🚚 Frete Grátis' : null,
            link: inputs.linkAfiliado.value.trim() || '{LINK}'
        };

        // Installment computation
        let parcelamentoStr = null;
        if (rawCurrentPrice >= 50) {
            const qtd = inputs.parcelasQtd.value;
            const valor = inputs.parcelasValor.value;
            const semJuros = inputs.parcelasSemJuros.checked;
            if (qtd && valor) {
                const formattedValor = parseFloat(valor.replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                parcelamentoStr = `💳 ${qtd}x de R$ ${formattedValor}${semJuros ? ' sem juros' : ''}`;
            }
        }

        // Determine category for Tag (all templates are now basically unified)
        let category = "MÉDIO";
        if (rawCurrentPrice < 30) { category = "BARATO"; }
        else if (rawCurrentPrice >= 150 && rawCurrentPrice <= 500) { category = "CARO"; }
        else if (rawCurrentPrice > 500) { category = "MUITO CARO"; }

        // BUILD MESSAGE (Unified Format)
        const msg = [
            FIXED.header,
            ``,
            `👉 *${data.titulo}*`,
            ``,
            `📦 *${data.nomeProduto}*`,
            `💰 ${data.precoAntigoStr ? `De ~R$ ${data.precoAntigoStr}~ ` : ''}Por *R$ ${data.precoAtualStr}*`,
            parcelamentoStr ? parcelamentoStr : null,
            data.frete ? data.frete : null,
            ``,
            `🛒 Comprar agora:`,
            data.link,
            ``,
            `✅ Grupo no WhatsApp com as ofertas:`,
            FIXED.linkGrupo
        ].filter(l => l !== null).join('\n');

        messageOutput.textContent = msg;
        priceTag.textContent = category;
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', generateMessage));
    generateMessage();

    btnSend.addEventListener('click', () => {
        const url = `https://wa.me/5544988602881?text=${encodeURIComponent(messageOutput.textContent)}`;
        window.open(url, '_blank');
    });
});
