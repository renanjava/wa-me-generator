document.addEventListener('DOMContentLoaded', () => {
    // Inputs (Visible)
    const inputs = {
        titulo: document.getElementById('titulo'),
        nomeProduto: document.getElementById('nomeProduto'),
        precoAntigo: document.getElementById('precoAntigo'),
        precoAtual: document.getElementById('precoAtual'),
        parcelamento: document.getElementById('parcelamento'),
        freteGratis: document.getElementById('freteGratis'),
        linkAfiliado: document.getElementById('linkAfiliado')
    };

    // Fixed Values
    const FIXED = {
        header: "📢 Itambé Promoções",
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
            parcelamento: (!parcelamentoContainer.classList.contains('hidden') && inputs.parcelamento.value.trim()) ? inputs.parcelamento.value.trim() : null,
            frete: inputs.freteGratis.checked ? '🚚 Frete Grátis' : null,
            link: inputs.linkAfiliado.value.trim() || '{LINK}'
        };

        // Determine CTA based on price
        let cta = "Comprar agora";
        let category = "MÉDIO";
        if (rawCurrentPrice < 30) { category = "BARATO"; }
        else if (rawCurrentPrice >= 150 && rawCurrentPrice <= 500) { cta = "Ver detalhes"; category = "CARO"; }
        else if (rawCurrentPrice > 500) { cta = "Ver detalhes e condições"; category = "MUITO CARO"; }

        // BUILD MESSAGE (Compact Format requested)
        const msg = [
            FIXED.header,
            ``,
            `👉 *${data.titulo}*`,
            ``,
            `📦 *${data.nomeProduto}*`,
            `💰 ${data.precoAntigoStr ? `De ~R$ ${data.precoAntigoStr}~ ` : ''}Por *R$ ${data.precoAtualStr}*`,
            data.parcelamento ? `💳 ${data.parcelamento}` : null,
            data.frete ? data.frete : null,
            ``,
            `👉 ${cta}:`,
            data.link,
            ``,
            `✅ Entre no grupo para mais ofertas:`,
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
