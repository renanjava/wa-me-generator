var App = App || {};

App.ProductCards = (function() {
    var WA_PHONE = '5544988602881';

    var WA_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382C17.112 14.382 14.665 13.342 14.305 13.342C13.945 13.342 13.585 13.842 13.465 13.962C12.745 14.682 9.42497 10.422 9.06497 10.062C8.94497 9.942 9.42497 8.982 9.42497 8.622C9.42497 8.262 9.06497 7.062 8.70497 6.102C8.34497 5.142 7.74497 5.622 7.50497 5.742C7.26497 5.862 6.54497 5.982 6.18497 6.342C5.94497 6.582 5.22497 7.302 5.22497 8.982C5.22497 10.662 6.54497 12.582 6.78497 12.942C7.98497 14.862 10.985 18.222 15.185 18.222C19.385 18.222 18.665 14.382 18.185 14.382C17.945 14.382 17.592 14.382 17.472 14.382Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> WhatsApp';

    var IG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/><path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Instagram';

    function parseProductNodes(rawJson) {
        var parsed = JSON.parse(rawJson);
        if (parsed.data && parsed.data.productOfferV2 && parsed.data.productOfferV2.nodes) {
            return parsed.data.productOfferV2.nodes;
        } else if (parsed.nodes) {
            return parsed.nodes;
        } else if (Array.isArray(parsed)) {
            return parsed;
        }
        return null;
    }

    function createProductCard(product) {
        var card = document.createElement('div');
        card.className = 'product-card-item';

        var commissionVal = product.commission ? parseFloat(product.commission).toFixed(2) : '0.00';
        var commissionPercentage = product.commissionRate ? (parseFloat(product.commissionRate) * 100).toFixed(1) + '%' : '';
        var commissionLabel = 'Ganho: R$ ' + commissionVal + ' (' + commissionPercentage + ')';

        var imgContainer = document.createElement('div');
        imgContainer.className = 'product-image-container';
        if (product.imageUrl) {
            var img = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = product.productName;
            imgContainer.appendChild(img);
        } else {
            imgContainer.innerHTML = '<span class="no-image-text">Sem imagem</span>';
        }

        var info = document.createElement('div');
        info.className = 'product-info';

        var title = document.createElement('div');
        title.className = 'product-title';
        title.textContent = product.productName;
        title.title = product.productName;

        var price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = 'R$ ' + product.price;

        var commDiv = document.createElement('div');
        commDiv.className = 'product-commission product-commission--highlight';
        commDiv.textContent = commissionLabel;

        info.appendChild(title);
        info.appendChild(price);
        info.appendChild(commDiv);

        var actions = document.createElement('div');
        actions.className = 'product-actions';

        var btnWA = document.createElement('button');
        btnWA.type = 'button';
        btnWA.className = 'btn-primary btn-sm btn-whatsapp';
        btnWA.innerHTML = WA_ICON;

        var btnIG = document.createElement('button');
        btnIG.type = 'button';
        btnIG.className = 'btn-primary btn-sm btn-instagram';
        btnIG.innerHTML = IG_ICON;

        btnWA.addEventListener('click', function() {
            App.Form.fillFormWithProduct(product);
            setTimeout(function() {
                var result = App.Form.getFormattedText();
                if (!result.valid) {
                    alert("Erro com os dados do produto.");
                    return;
                }
                var url = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(result.wa);
                window.open(url, '_blank');
            }, 50);
        });

        btnIG.addEventListener('click', async function() {
            App.Form.fillFormWithProduct(product);
            var result = App.Form.getFormattedText();
            if (!result.valid) return;

            await App.Share.copyToClipboard(product.offerLink);

            var originalBtnContent = btnIG.innerHTML;
            btnIG.innerHTML = '⏳ Gerando...';
            btnIG.disabled = true;

            try {
                await App.StoryCanvas.generate(product, result);
                btnIG.innerHTML = '✅ Pronto!';
                setTimeout(function() {
                    btnIG.innerHTML = originalBtnContent;
                    btnIG.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('Erro ao gerar imagem:', err);
                btnIG.innerHTML = '❌ Erro';
                setTimeout(function() {
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

        return card;
    }

    function init() {
        var btnLoadJson = document.getElementById('btnLoadJson');
        var jsonInput = document.getElementById('jsonInput');
        var productsList = document.getElementById('productsList');
        var btnFetchHighCommission = document.getElementById('btnFetchHighCommission');


        btnLoadJson.addEventListener('click', function() {
            var rawJson = jsonInput.value.trim();
            productsList.innerHTML = '';
            if (!rawJson) {
                alert("Cole o JSON primeiro!");
                return;
            }

            try {
                var nodes = parseProductNodes(rawJson);
                if (!nodes) {
                    alert("Estrutura do JSON não reconhecida. Certifique-se que contém 'productOfferV2.nodes'.");
                    return;
                }
                if (nodes.length === 0) {
                    alert("Nenhum produto encontrado no JSON.");
                    return;
                }

                nodes.forEach(function(product) {
                    productsList.appendChild(createProductCard(product));
                });
                alert('✅ ' + nodes.length + ' produtos carregados! Clique neles para enviar.');
            } catch (e) {
                console.error(e);
                alert("Erro ao ler JSON. Verifique a formatação.");
            }
        });

        btnFetchHighCommission.addEventListener('click', async function() {
            var originalBtnContent = btnFetchHighCommission.innerHTML;
            btnFetchHighCommission.innerHTML = '⏳ Buscando produtos...';
            btnFetchHighCommission.disabled = true;

            try {
                var response = await fetch('/api/high-commission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Falha ao buscar produtos');

                var data = await response.json();
                var products = data.data?.productOfferV2?.nodes || [];

                if (products.length === 0) {
                    alert('Nenhum produto encontrado!');
                    return;
                }

                btnFetchHighCommission.innerHTML = '⏳ Sincronizando com Google Sheets...';

                var responseUpdate = await fetch('/api/update-sheets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: products })
                });

                if (!responseUpdate.ok) {
                    var errorData = await responseUpdate.json();
                    throw new Error(errorData.error || 'Falha ao sincronizar');
                }

                btnFetchHighCommission.innerHTML = '✅ Planilha Atualizada!';

                alert('✅ SUCESSO!\n\n' + products.length + ' produtos de alta comissão foram enviados diretamente para a sua planilha Google.\n\nVocê não precisa mais copiar e colar nada!');

                setTimeout(function() {
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
    }

    return { init };
})();
