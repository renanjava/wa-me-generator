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
        msgLinesWA.push(``, `🛒 Comprar agora: ${data.link}`, ``, `✅ Grupo no WhatsApp com as ofertas: ${FIXED.linkGrupo}`);

        const msgLinesIG = [];
        msgLinesIG.push(`🔥 Por R$ ${data.precoAtualStr}`);
        msgLinesIG.push(``, `🛒 Comprar agora: ${data.link}`);
        msgLinesIG.push(``, `✅ Grupo no WhatsApp: ${FIXED.linkGrupo}`);

        return {
            wa: msgLinesWA.filter(l => l !== null).join('\n'),
            ig: msgLinesIG.filter(l => l !== null).join('\n'),
            category,
            data,
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
    const btnFetchHighCommission = document.getElementById('btnFetchHighCommission');

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

            nodes.forEach((product) => {
                const card = document.createElement('div');
                card.className = 'product-card-item';
                
                // Formatação dos novos dados
                const commissionVal = product.commission ? parseFloat(product.commission).toFixed(2) : '0.00';
                const commissionPercentage = product.commissionRate ? (parseFloat(product.commissionRate) * 100).toFixed(1) + '%' : '';
                const commissionLabel = `Ganho: R$ ${commissionVal} (${commissionPercentage})`;

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
                commDiv.style.color = '#10b981';
                commDiv.style.fontWeight = 'bold';
                commDiv.style.fontSize = '12px';
                commDiv.textContent = commissionLabel;

                info.appendChild(title);
                info.appendChild(price);
                info.appendChild(commDiv);

                const actions = document.createElement('div');
                actions.className = 'product-actions';
                const btnWA = document.createElement('button');
                btnWA.type = 'button';
                btnWA.className = 'btn-primary btn-sm btn-whatsapp';
                btnWA.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382C17.112 14.382 14.665 13.342 14.305 13.342C13.945 13.342 13.585 13.842 13.465 13.962C12.745 14.682 9.42497 10.422 9.06497 10.062C8.94497 9.942 9.42497 8.982 9.42497 8.622C9.42497 8.262 9.06497 7.062 8.70497 6.102C8.34497 5.142 7.74497 5.622 7.50497 5.742C7.26497 5.862 6.54497 5.982 6.18497 6.342C5.94497 6.582 5.22497 7.302 5.22497 8.982C5.22497 10.662 6.54497 12.582 6.78497 12.942C7.98497 14.862 10.985 18.222 15.185 18.222C19.385 18.222 18.665 14.382 18.185 14.382C17.945 14.382 17.592 14.382 17.472 14.382Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> WhatsApp`;

                const btnIG = document.createElement('button');
                btnIG.type = 'button';
                btnIG.className = 'btn-primary btn-sm btn-instagram';
                btnIG.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/><path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Instagram`;

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

                    try {
                        await navigator.clipboard.writeText(product.offerLink);
                    } catch (err) {
                        console.warn('Não foi possível copiar:', err);
                    }

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

    btnFetchHighCommission.addEventListener('click', async () => {
        const originalBtnContent = btnFetchHighCommission.innerHTML;
        btnFetchHighCommission.innerHTML = '⏳ Buscando produtos...';
        btnFetchHighCommission.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/high-commission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar produtos');
            }

            const data = await response.json();
            const products = data.data?.productOfferV2?.nodes || [];

            if (products.length === 0) {
                alert('Nenhum produto encontrado!');
                return;
            }

            btnFetchHighCommission.innerHTML = '⏳ Sincronizando com Google Sheets...';

            const responseUpdate = await fetch('http://localhost:3000/api/update-sheets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: products })
            });

            if (!responseUpdate.ok) {
                const errorData = await responseUpdate.json();
                throw new Error(errorData.error || 'Falha ao sincronizar');
            }

            btnFetchHighCommission.innerHTML = '✅ Planilha Atualizada!';
            
            alert(`✅ SUCESSO!\n\n${products.length} produtos de alta comissão foram enviados diretamente para a sua planilha Google.\n\nVocê não precisa mais copiar e colar nada!`);

            setTimeout(() => {
                btnFetchHighCommission.innerHTML = originalBtnContent;
                btnFetchHighCommission.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Erro ao buscar produtos. Verifique se o servidor está rodando.');
            btnFetchHighCommission.innerHTML = originalBtnContent;
            btnFetchHighCommission.disabled = false;
        }
    });
});

async function generateStoryImage(product, formattedData) {
    const canvas = document.getElementById('storyCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 70px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("📢 Itambé Promoções", 540, 250);
    ctx.shadowBlur = 0;

    const cardY = 320;
    const cardHeight = 1200;
    const cardWidth = 1000;
    const cardX = (1080 - cardWidth) / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 40);
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = product.imageUrl;
        });

        const imgAreaMargin = 30;
        const imgAreaW = cardWidth - (imgAreaMargin * 2);
        const imgAreaH = cardHeight - 380; 
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
        ctx.fillStyle = '#cccccc';
        ctx.font = '40px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Imagem indisponível", 540, cardY + 400);
    }

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.font = '600 48px Outfit, sans-serif';
    const productName = product.productName;
    const nameY = cardY + cardHeight - 270;
    wrapText(ctx, productName, 540, nameY, cardWidth - 80, 55, 2);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 110px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`R$ ${formattedData.data.precoAtualStr}`, 540, cardY + cardHeight - 80);

    ctx.textAlign = 'left';
    ctx.font = 'bold 65px Outfit, sans-serif';
    ctx.fillStyle = '#FFFFFF';

    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('Canvas to Blob falhou'));
                return;
            }
            
            await shareToInstagramStories(blob, product, resolve, reject);
        }, 'image/png');
    });
}

async function shareToInstagramStories(blob, product, resolve, reject) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        try {
            const file = new File([blob], 'story-promocao.png', { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Compartilhar no Instagram',
                    text: 'Promoção Itambé'
                });
                resolve(true);
                return;
            }
            
            const dataUrl = await blobToDataURL(blob);
            const instagramUrl = `instagram://story-camera`;
            
            const tempLink = document.createElement('a');
            tempLink.href = instagramUrl;
            tempLink.click();
            
            alert('📱 A imagem foi preparada!\n\n1. O Instagram será aberto agora\n2. Quando o Instagram abrir, clique no ícone de galeria\n3. Selecione a imagem que acabou de ser baixada\n4. Publique nos Stories!');
            
            tryDownload(blob, product.productName, resolve);
            
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            tryDownload(blob, product.productName, resolve);
        }
    } else {
        try {
            const clipboardItem = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([clipboardItem]);
            
            alert('✅ Imagem copiada!\n\n📋 A imagem está na área de transferência.\n\nPara publicar:\n1. Abra o Instagram no seu celular ou navegador\n2. Vá em criar Story\n3. Cole a imagem (Ctrl+V)\n4. Publique!\n\n💡 Se preferir, a imagem também será baixada automaticamente.');
            
            window.open('https://www.instagram.com/create/story/', '_blank');
            
            tryDownload(blob, product.productName, resolve);
            
        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert('📥 A imagem será baixada.\n\nPara publicar nos Stories:\n1. Abra o Instagram no seu celular\n2. Toque em criar Story\n3. Selecione a imagem baixada da galeria\n4. Publique!');
            tryDownload(blob, product.productName, resolve);
        }
    }
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function tryDownload(blob, name, resolve) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-promocao-${name.substring(0, 20)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve(true);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 1;

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            if (lineCount === maxLines) {
                ctx.fillText(line.trim() + '...', x, y);
                return;
            }
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, y);
}
