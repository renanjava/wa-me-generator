document.addEventListener('DOMContentLoaded', () => {
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

    const FIXED = {
        header: "📢 Itambé/PR Promoções",
        linkGrupo: "https://chat.whatsapp.com/GduFGpLaZuv2RDu0SMBT8e"
    };

    const parcelamentoContainer = document.getElementById('parcelamentoContainer');

    const messageOutput = document.getElementById('messageOutput');
    const priceTag = document.getElementById('priceTag');
    const btnSend = document.getElementById('btnSend');

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

        const msgLines = [
            FIXED.header,
            ``
        ];

        if (data.titulo) {
            msgLines.push(`👉 *${data.titulo}*`);
            msgLines.push(``);
        }

        msgLines.push(`📦 *${data.nomeProduto}*`);
        msgLines.push(``);

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
        
        resetForm();
    });

    const btnLoadJson = document.getElementById('btnLoadJson');
    const jsonInput = document.getElementById('jsonInput');
    const productsList = document.getElementById('productsList');

    btnLoadJson.addEventListener('click', () => {
        const rawJson = jsonInput.value.trim();
        productsList.innerHTML = '';

        if (!rawJson) {
            alert("Cole o JSON primeiro!");
            return;
        }

        try {
            const parsed = JSON.parse(rawJson);
            
            let nodes = [];
            if (parsed.data && parsed.data.productOfferV2 && parsed.data.productOfferV2.nodes) {
                nodes = parsed.data.productOfferV2.nodes;
            } else if (parsed.nodes) {
                nodes = parsed.nodes;
            } else if (Array.isArray(parsed)) {
                nodes = parsed;
            } else {
                alert("Estrutura do JSON não reconhecida. Certifique-se que contém 'productOfferV2.nodes'.");
                return;
            }
            
            if (nodes.length === 0) {
                alert("Nenhum produto encontrado no JSON.");
                return;
            }

            nodes.forEach((product, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'product-btn';
                btn.style.width = '100%';
                btn.style.textAlign = 'left';
                btn.style.padding = '10px';
                btn.style.border = '1px solid #ddd';
                btn.style.borderRadius = '5px';
                btn.style.backgroundColor = '#f9fafb';
                btn.style.cursor = 'pointer';
                btn.style.marginBottom = '5px';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.gap = '10px';
                
                const commission = product.commission ? `(Comissão: R$ ${parseFloat(product.commission).toFixed(2)})` : '';
                
                btn.innerHTML = `
                    <div style="font-weight: bold; color: #4b5563;">#${index + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${product.productName.substring(0, 50)}...</div>
                        <div style="font-size: 12px; color: #6b7280;">Preço: R$ ${product.price} <span style="color: #10b981;">${commission}</span></div>
                    </div>
                    <div style="font-size: 20px;">➡️</div>
                `;

                btn.addEventListener('click', () => {
                    inputs.titulo.value = "🔥 MAIS VENDIDO!";
                    inputs.nomeProduto.value = product.productName;
                    inputs.precoAntigo.value = "";
                    inputs.precoAtual.value = product.price.toString();
                    inputs.linkAfiliado.value = product.offerLink;
                    inputs.freteGratis.checked = true;
                    inputs.comCupom.checked = true;

                    generateMessage();

                    const text = messageOutput.textContent;
                    const url = `https://wa.me/5544988602881?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    
                    btn.style.backgroundColor = '#d1fae5';
                    btn.style.borderColor = '#10b981';
                });

                productsList.appendChild(btn);
            });

            alert(`✅ ${nodes.length} produtos carregados! Clique neles para enviar.`);

        } catch (e) {
            console.error(e);
            alert("Erro ao ler JSON. Verifique a formatação.");
        }
    });
});
