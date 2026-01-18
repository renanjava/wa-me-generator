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
        linkGrupo: "https://chat.whatsapp.com/G4cttd3Ykv0IjQH00i3LVo"
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

    const getFormattedText = () => {
        const rawCurrentPrice = parseFloat(inputs.precoAtual.value.replace(',', '.'));
        const rawOldPrice = parseFloat(inputs.precoAntigo.value.replace(',', '.'));
        
        // Show/Hide Parcelamento UI
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

        // --- WhatsApp Generation ---
        const msgLinesWA = [
            FIXED.header,
            ``
        ];
        if (data.titulo) {
            msgLinesWA.push(`👉 *${data.titulo}*`);
            msgLinesWA.push(``);
        }
        msgLinesWA.push(`📦 *${data.nomeProduto}*`);
        msgLinesWA.push(``);
        if (data.precoAntigoStr) {
            msgLinesWA.push(`~💰 De R$ ${data.precoAntigoStr}~`);
        }
        msgLinesWA.push(`💰 Por *R$ ${data.precoAtualStr}*`);

        if (parcelamentoStr) msgLinesWA.push(parcelamentoStr);
        if (data.frete) msgLinesWA.push(data.frete);
        if (data.cupom) msgLinesWA.push(data.cupom);

        msgLinesWA.push(
            ``,
            `🛒 Comprar agora:`,
            data.link,
            ``,
            `✅ Grupo no WhatsApp com as ofertas:`,
            FIXED.linkGrupo
        );

        // --- Instagram Generation (Simplified) ---
        const msgLinesIG = [];
        // Only Price, Affiliate Link, Group Link
        msgLinesIG.push(`� Por R$ ${data.precoAtualStr}`);
        
        msgLinesIG.push(
            ``,
            `🛒 Comprar agora:`,
            data.link
        );

        msgLinesIG.push(
            ``,
            `✅ Grupo no WhatsApp:`,
            FIXED.linkGrupo
        );

        return {
            wa: msgLinesWA.filter(l => l !== null).join('\n'),
            ig: msgLinesIG.filter(l => l !== null).join('\n'),
            category,
            valid: true
        };
    };

    const generateMessage = () => {
        const result = getFormattedText();
        
        if (!result.valid) {
            if (messageOutput) messageOutput.textContent = 'Aguardando preço do produto...';
            if (priceTag) priceTag.textContent = 'Aguardando preço...';
            return;
        }

        if (messageOutput) messageOutput.textContent = result.wa;
        if (priceTag) priceTag.textContent = result.category;
    };


    Object.values(inputs).forEach(input => input.addEventListener('input', generateMessage));
    generateMessage();

    if (btnSend) {
        btnSend.addEventListener('click', () => {
            const result = getFormattedText();
            if (result.valid) {
                const url = `https://wa.me/5544988602881?text=${encodeURIComponent(result.wa)}`;
                window.open(url, '_blank');
                resetForm();
            }
        });
    }
    
    // ... JSON Loading Logic ...


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
                const card = document.createElement('div');
                card.className = 'product-card-item';
                
                const commission = product.commission ? `(Comissão: R$ ${parseFloat(product.commission).toFixed(2)})` : '';
                
                // Larger image container
                const imgContainer = document.createElement('div');
                imgContainer.className = 'product-image-container';
                if (product.imageUrl) {
                    const img = document.createElement('img');
                    img.src = product.imageUrl;
                    img.alt = product.productName;
                    imgContainer.appendChild(img);
                } else {
                    imgContainer.innerHTML = '<span style="color: #ccc;">Sem imagem</span>';
                }

                // Info container
                const info = document.createElement('div');
                info.className = 'product-info';
                
                const title = document.createElement('div');
                title.className = 'product-title';
                title.textContent = product.productName;
                title.title = product.productName; // tooltip
                
                const price = document.createElement('div');
                price.className = 'product-price';
                price.textContent = `R$ ${product.price}`;
                
                const commDiv = document.createElement('div');
                commDiv.className = 'product-commission';
                commDiv.textContent = commission;

                info.appendChild(title);
                info.appendChild(price);
                info.appendChild(commDiv);

                // Actions container
                const actions = document.createElement('div');
                actions.className = 'product-actions';

                // WA Button
                const btnWA = document.createElement('button');
                btnWA.type = 'button';
                btnWA.className = 'btn-primary btn-sm btn-whatsapp';
                btnWA.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382C17.112 14.382 14.665 13.342 14.305 13.342C13.945 13.342 13.585 13.842 13.465 13.962C12.745 14.682 9.42497 10.422 9.06497 10.062C8.94497 9.942 9.42497 8.982 9.42497 8.622C9.42497 8.262 9.06497 7.062 8.70497 6.102C8.34497 5.142 7.74497 5.622 7.50497 5.742C7.26497 5.862 6.54497 5.982 6.18497 6.342C5.94497 6.582 5.22497 7.302 5.22497 8.982C5.22497 10.662 6.54497 12.582 6.78497 12.942C7.98497 14.862 10.985 18.222 15.185 18.222C19.385 18.222 18.665 14.382 18.185 14.382C17.945 14.382 17.592 14.382 17.472 14.382Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    WhatsApp
                `;

                // IG Button
                const btnIG = document.createElement('button');
                btnIG.type = 'button';
                btnIG.className = 'btn-primary btn-sm btn-instagram';
                btnIG.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/>
                        <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/>
                        <path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Instagram
                `;

                // Fill Form Helper
                const fillForm = () => {
                    inputs.titulo.value = "";
                    inputs.nomeProduto.value = product.productName;
                    inputs.precoAntigo.value = "";
                    inputs.precoAtual.value = product.price.toString();
                    inputs.linkAfiliado.value = product.offerLink;
                    inputs.freteGratis.checked = false;
                    inputs.comCupom.checked = false;
                    generateMessage();
                };

                // WA Action
                btnWA.addEventListener('click', () => {
                    fillForm();
                    // Slight timeout to respect the data flow, although getFormattedText pulls from inputs directly.
                    // inputs are updated by fillForm -> generateMessage (optional but cleaner to have inputs set).
                    setTimeout(() => {
                        const result = getFormattedText();
                        if (!result.valid) {
                            alert("Erro com os dados do produto.");
                            return;
                        }
                        const url = `https://wa.me/5544988602881?text=${encodeURIComponent(result.wa)}`;
                        window.open(url, '_blank');
                    }, 50);
                });

                // IG Action
                btnIG.addEventListener('click', async () => {
                    fillForm();
                    
                    const result = getFormattedText();
                    if (!result.valid) return;

                    const text = result.ig;
                    // Use the product image URL as requested
                    const storyImageUrl = product.imageUrl;
                    const igAppLink = `instagram://story-camera?backgroundImageUrl=${encodeURIComponent(storyImageUrl)}`;
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    
                    try {
                        await navigator.clipboard.writeText(text);
                        btnIG.innerHTML = '📋 Copiado!';
                        setTimeout(() => btnIG.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/>
                                <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/>
                                <path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Instagram
                        `, 2000);
                    } catch (err) {
                        console.warn('Clipboard failed', err);
                    }

                    if (isMobile) {
                        window.location.href = igAppLink;
                    } else {
                        // Desktop fallback (optional, but good to keep)
                        const encodedUrl = encodeURIComponent(storyImageUrl);
                        const w = window.open(`https://www.instagram.com/create/story/?media=${encodedUrl}`, '_blank');
                        if (!w) alert("Pop-up bloqueado!");
                    }
                });

                actions.appendChild(btnWA);
                actions.appendChild(btnIG);

                card.appendChild(imgContainer);
                card.appendChild(info);
                card.appendChild(actions);

                productsList.appendChild(card);
            });

            alert(`✅ ${nodes.length} produtos carregados! Clique neles para enviar.`);

        } catch (e) {
            console.error(e);
            alert("Erro ao ler JSON. Verifique a formatação.");
        }
    });
});
