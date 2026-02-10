import { Form } from './form.js';
import { Share } from './share.js';
import { StoryCanvas } from './storyCanvas.js';

export const ProductCards = (function() {

    var IG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/><path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Instagram';

    function createProductCard(product) {
        var card = document.createElement('div');
        card.className = 'product-card-item';

        var commissionVal = product.commission ? parseFloat(product.commission).toFixed(2) : null;
        var commissionPercentage = product.commissionRate ? (parseFloat(product.commissionRate) * 100).toFixed(1) + '%' : null;

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

        info.appendChild(title);
        info.appendChild(price);

        if (commissionVal && commissionPercentage) {
            var commDiv = document.createElement('div');
            commDiv.className = 'product-commission product-commission--highlight';
            commDiv.textContent = 'Ganho: R$ ' + commissionVal + ' (' + commissionPercentage + ')';
            info.appendChild(commDiv);
        }

        var actions = document.createElement('div');
        actions.className = 'product-actions';

        var btnIG = document.createElement('button');
        btnIG.type = 'button';
        btnIG.className = 'btn-primary btn-sm btn-instagram';
        btnIG.innerHTML = IG_ICON;

        btnIG.addEventListener('click', async function() {
            Form.fillFormWithProduct(product);
            var result = Form.getFormattedText();
            if (!result.valid) return;

            await Share.copyToClipboard(product.offerLink);

            var originalBtnContent = btnIG.innerHTML;
            btnIG.innerHTML = '⏳ Gerando...';
            btnIG.disabled = true;

            try {
                await StoryCanvas.generate(product, result);
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

        actions.appendChild(btnIG);
        card.appendChild(imgContainer);
        card.appendChild(info);
        card.appendChild(actions);

        return card;
    }

    function renderProducts(products) {
        var productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (!products || products.length === 0) {
            productsList.innerHTML = '<p class="empty-state">Nenhum produto disponível. Aguarde a próxima atualização.</p>';
            return;
        }

        products.forEach(function(product) {
            productsList.appendChild(createProductCard(product));
        });
    }

    function updateLastUpdateBadge(meta) {
        var badge = document.getElementById('lastUpdateBadge');
        if (!badge || !meta || !meta.lastUpdate) return;

        var date = new Date(meta.lastUpdate);
        var formatted = date.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        badge.textContent = '🕐 Última atualização: ' + formatted;
        badge.classList.add('badge--active');
    }

    const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_WEBAPP_URL_BESTSELLERS;

    async function loadProducts() {
        var productsList = document.getElementById('productsList');
        productsList.innerHTML = '<p class="loading-state">⏳ Carregando produtos...</p>';

        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('undefined')) {
            console.error('❌ ERRO: URL do Google Script não encontrada nas variáveis de ambiente!');
            productsList.innerHTML = '<p class="error-state">❌ Erro de configuração: VITE_GOOGLE_WEBAPP_URL_BESTSELLERS não definida no .env ou servidor não reiniciado.</p>';
            return;
        }

        try {
            var response = await fetch(GOOGLE_SCRIPT_URL);
            
            if (!response.ok) throw new Error('Falha ao carregar');

            var data = await response.json();
            renderProducts(data.products || []);
            updateLastUpdateBadge(data.meta);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = '<p class="error-state">❌ Erro ao carregar produtos. Verifique a URL do Script.</p>';
        }
    }

    function init() {
        loadProducts();
    }

    return { init, renderProducts };
})();
