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

        const msgLinesIG = [];
        msgLinesIG.push(`🔥 Por R$ ${data.precoAtualStr}`);
        
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

                const info = document.createElement('div');
                info.className = 'product-info';
                
                const title = document.createElement('div');
                title.className = 'product-title';
                title.textContent = product.productName;
                title.title = product.productName; 
                
                const price = document.createElement('div');
                price.className = 'product-price';
                price.textContent = `R$ ${product.price}`;
                
                const commDiv = document.createElement('div');
                commDiv.className = 'product-commission';
                commDiv.textContent = commission;

                info.appendChild(title);
                info.appendChild(price);
                info.appendChild(commDiv);

                const actions = document.createElement('div');
                actions.className = 'product-actions';

                const btnWA = document.createElement('button');
                btnWA.type = 'button';
                btnWA.className = 'btn-primary btn-sm btn-whatsapp';
                btnWA.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382C17.112 14.382 14.665 13.342 14.305 13.342C13.945 13.342 13.585 13.842 13.465 13.962C12.745 14.682 9.42497 10.422 9.06497 10.062C8.94497 9.942 9.42497 8.982 9.42497 8.622C9.42497 8.262 9.06497 7.062 8.70497 6.102C8.34497 5.142 7.74497 5.622 7.50497 5.742C7.26497 5.862 6.54497 5.982 6.18497 6.342C5.94497 6.582 5.22497 7.302 5.22497 8.982C5.22497 10.662 6.54497 12.582 6.78497 12.942C7.98497 14.862 10.985 18.222 15.185 18.222C19.385 18.222 18.665 14.382 18.185 14.382C17.945 14.382 17.592 14.382 17.472 14.382Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    WhatsApp
                `;

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

                btnWA.addEventListener('click', () => {
                    fillForm();
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

                btnIG.addEventListener('click', async () => {
                    fillForm();
                    
                    const result = getFormattedText();
                    if (!result.valid) return;

                    // 1. COPIAR LINKS PARA CLIPBOARD
                    const linkText = `Link da oferta: ${product.offerLink}\nLink do grupo: https://chat.whatsapp.com/G4cttd3Ykv0IjQH00i3LVo`;
                    
                    try {
                        await navigator.clipboard.writeText(linkText);
                    } catch (err) {
                        console.warn('Não foi possível copiar:', err);
                    }

                    // 2. GERAR IMAGEM E COMPARTILHAR
                    const originalBtnContent = btnIG.innerHTML;
                    btnIG.innerHTML = '⏳ Gerando...';
                    btnIG.disabled = true;

                    try {
                        await generateStoryImage(product, result);
                        
                        btnIG.innerHTML = '✅ Pronto!';
                        setTimeout(() => {
                            btnIG.innerHTML = originalBtnContent;
                            btnIG.disabled = false;
                        }, 2000);

                    } catch (err) {
                        console.error('Erro ao gerar imagem:', err);
                        btnIG.innerHTML = '❌ Erro';
                        setTimeout(() => {
                            btnIG.innerHTML = originalBtnContent;
                            btnIG.disabled = false;
                        }, 2000);
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

// FUNÇÕES AUXILIARES PARA GERAR STORY

async function generateStoryImage(product, formattedData) {
    const canvas = document.getElementById('storyCanvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar tamanho
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Fundo Gradiente Moderno
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    // Roxo (#2b1055) -> Rosa (#7597de) -> Azul (#2b1055) - Exemplo vibrante
    gradient.addColorStop(0, '#4facfe');
    gradient.addColorStop(1, '#00f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Adicionar um overlay sutil para textura (opcional, ou apenas manter o gradiente limpo)
    
    // 2. Cabeçalho
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.fillText("📢 Itambé Promoções", 540, 150);
    ctx.shadowBlur = 0; // Reset shadow

    // 3. Card do Produto (Fundo Branco)
    const cardY = 300;
    const cardHeight = 900;
    const cardWidth = 900;
    const cardX = (1080 - cardWidth) / 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 40);
    ctx.fill();
    
    // Sombra do card
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Imagem do Produto
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Importante para CORS
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = product.imageUrl;
        });

        // Desenhar imagem mantendo proporção dentro do card
        // Área disponível para imagem dentro do card
        const imgAreaMargin = 50;
        const imgAreaW = cardWidth - (imgAreaMargin * 2);
        const imgAreaH = cardHeight - 350; // Deixar espaço embaixo para info
        const imgAreaX = cardX + imgAreaMargin;
        const imgAreaY = cardY + imgAreaMargin;

        const scale = Math.min(imgAreaW / img.width, imgAreaH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = imgAreaX + (imgAreaW - w) / 2;
        const y = imgAreaY + (imgAreaH - h) / 2;

        ctx.drawImage(img, x, y, w, h);

    } catch (e) {
        console.warn('Erro ao carregar imagem do produto:', e);
        // Fallback se falhar imagem
        ctx.fillStyle = '#cccccc';
        ctx.font = '40px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Imagem indisponível", 540, cardY + 300);
    }

    // 5. Preço (Dentro do card, parte inferior)
    const priceY = cardY + cardHeight - 160;
    
    // Preço Antigo (se houver)
    if (formattedData.precoAntigoStr) {
        ctx.fillStyle = '#999999';
        ctx.font = '36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        const oldPriceText = `De R$ ${formattedData.precoAntigoStr}`;
        ctx.fillText(oldPriceText, 540, priceY - 70);
        
        // Riscar preço antigo
        const textWidth = ctx.measureText(oldPriceText).width;
        ctx.beginPath();
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 3;
        ctx.moveTo(540 - textWidth/2, priceY - 82);
        ctx.lineTo(540 + textWidth/2, priceY - 82);
        ctx.stroke();
    }

    // Preço Atual
    ctx.fillStyle = '#ef4444'; // Vermelho preço
    ctx.font = 'bold 90px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`R$ ${formattedData.precoAtualStr}`, 540, priceY + 20);

    // 6. Nome do Produto (Abaixo do card)
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = '600 50px Outfit, sans-serif';
    
    // Quebra de linha automática
    const productName = product.productName;
    wrapText(ctx, productName, 540, cardY + cardHeight + 80, 900, 65, 3); // Max 3 linhas

    // 7. Call to Action (Links)
    ctx.textAlign = 'left';
    ctx.font = 'bold 40px Outfit, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    
    const footerStartY = 1600;
    const spacer = 140;

    // Link Comprar
    ctx.fillText("🛒 Comprar:", 100, footerStartY);
    // Linha pontilhada/retângulo para colar link
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(90, footerStartY + 20, 900, 80);
    ctx.setLineDash([]); // Reset

    // Link Grupo
    ctx.fillText("✅ Grupo:", 100, footerStartY + spacer + 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(90, footerStartY + spacer + 40, 900, 80);

    // 8. Compartilhar
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('Canvas to Blob falhou'));
                return;
            }

            const file = new File([blob], 'story-promocao.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Promoção Itambé',
                        text: 'Olha essa oferta!'
                    });
                    resolve(true); // Compartilhado com sucesso (ou aberto dialog)
                } catch (shareError) {
                    if (shareError.name === 'AbortError') {
                         resolve(false); // Usuário cancelou, mas não é erro técnico
                    } else {
                        // Se falhar o share, tenta download
                        tryDownload(blob, product.productName, resolve);
                    }
                }
            } else {
                // Fallback Desktop
                tryDownload(blob, product.productName, resolve);
            }
        }, 'image/png');
    });
}

function tryDownload(blob, name, resolve) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${name.substring(0, 20)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve(true);
}

// Função auxiliar para quebra de texto
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 1;

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
            if (lineCount > maxLines) {
                // Adicionar reticências na linha anterior se exceder
                // (Isso é uma simplificação, idealmente cortaria o texto)
                const lastLineWithEllipsis = line.trim() + '...';
                // ctx.fillText(lastLineWithEllipsis, x, y); // Desenha a ultima parte
                return;
            }
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, y);
}
