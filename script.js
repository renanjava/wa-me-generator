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
        comCupom: document.getElementById('comCupom'),
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

    // Reset Form Function
    const resetForm = () => {
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
        
        // Trigger regeneration
        generateMessage();
    };

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
            priceTag.textContent = 'Aguardando preço...';
            return;
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

        // Installment computation
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

        // Determine category for Tag
        let category = "MÉDIO";
        if (rawCurrentPrice < 30) { category = "BARATO"; }
        else if (rawCurrentPrice >= 150 && rawCurrentPrice <= 500) { category = "CARO"; }
        else if (rawCurrentPrice > 500) { category = "MUITO CARO"; }

        // BUILD MESSAGE
        const msgLines = [
            FIXED.header,
            ``
        ];

        // Title is optional now
        if (data.titulo) {
            msgLines.push(`👉 *${data.titulo}*`);
            msgLines.push(``);
        }

        msgLines.push(`📦 *${data.nomeProduto}*`);

        // Price lines
        if (data.precoAntigoStr) {
            msgLines.push(`~💰 De R$ ${data.precoAntigoStr}~`);
        }
        msgLines.push(`💰 Por *R$ ${data.precoAtualStr}*`);

        if (parcelamentoStr) msgLines.push(parcelamentoStr);
        if (data.frete) msgLines.push(data.frete);
        if (data.cupom) msgLines.push(data.cupom);

        msgLines.push(
            ``,
            `🛒 Comprar agora:`,
            data.link,
            ``,
            `✅ Grupo no WhatsApp com as ofertas:`,
            FIXED.linkGrupo
        );

        messageOutput.textContent = msgLines.filter(l => l !== null).join('\n');
        priceTag.textContent = category;
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', generateMessage));
    generateMessage();

    btnSend.addEventListener('click', () => {
        const url = `https://wa.me/5544988602881?text=${encodeURIComponent(messageOutput.textContent)}`;
        window.open(url, '_blank');
        
        // Reset form after sending
        resetForm();
    });
});
