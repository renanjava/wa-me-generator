import type { Product, SheetResponse } from './types';
import { Form } from './form';
import type { FormResult } from './types';
import { Share } from './share';
import { StoryCanvas } from './storyCanvas';

export const ProductCards = (function () {

    const IG_ICON: string = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/><path d="M17.5 6.5H17.51" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Instagram';

    function createProductCard(product: Product): HTMLDivElement {
        const card: HTMLDivElement = document.createElement('div');
        card.className = 'product-card-item';

        const commissionVal: string | null = product.commission ? parseFloat(String(product.commission)).toFixed(2) : null;
        const commissionPercentage: string | null = product.commissionRate ? (parseFloat(String(product.commissionRate)) * 100).toFixed(1) + '%' : null;

        const imgContainer: HTMLDivElement = document.createElement('div');
        imgContainer.className = 'product-image-container';
        if (product.imageUrl) {
            const img: HTMLImageElement = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = product.productName;
            imgContainer.appendChild(img);
        } else {
            imgContainer.innerHTML = '<span class="no-image-text">Sem imagem</span>';
        }

        const info: HTMLDivElement = document.createElement('div');
        info.className = 'product-info';

        const title: HTMLDivElement = document.createElement('div');
        title.className = 'product-title';
        title.textContent = product.productName;
        title.title = product.productName;

        const price: HTMLDivElement = document.createElement('div');
        price.className = 'product-price';
        price.textContent = 'R$ ' + product.price;

        info.appendChild(title);
        info.appendChild(price);

        if (commissionVal && commissionPercentage) {
            const commDiv: HTMLDivElement = document.createElement('div');
            commDiv.className = 'product-commission product-commission--highlight';
            commDiv.textContent = 'Ganho: R$ ' + commissionVal + ' (' + commissionPercentage + ')';
            info.appendChild(commDiv);
        }

        const actions: HTMLDivElement = document.createElement('div');
        actions.className = 'product-actions';

        const btnIG: HTMLButtonElement = document.createElement('button');
        btnIG.type = 'button';
        btnIG.className = 'btn-primary btn-sm btn-instagram';
        btnIG.innerHTML = IG_ICON;

        btnIG.addEventListener('click', async function (): Promise<void> {
            Form.fillFormWithProduct(product);
            const result: FormResult = Form.getFormattedText();
            if (!result.valid) return;

            await Share.copyToClipboard(product.offerLink);

            const originalBtnContent: string = btnIG.innerHTML;
            btnIG.innerHTML = '⏳ Gerando...';
            btnIG.disabled = true;

            try {
                await StoryCanvas.generate(product, result);
                btnIG.innerHTML = '✅ Pronto!';
                setTimeout(function (): void {
                    btnIG.innerHTML = originalBtnContent;
                    btnIG.disabled = false;
                }, 2000);
            } catch (err: unknown) {
                console.error('Erro ao gerar imagem:', err);
                btnIG.innerHTML = '❌ Erro';
                setTimeout(function (): void {
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

    function renderProducts(products: Product[]): void {
        const productsList = document.getElementById('productsList') as HTMLDivElement;
        productsList.innerHTML = '';

        if (!products || products.length === 0) {
            productsList.innerHTML = '<p class="empty-state">Nenhum produto disponível. Aguarde a próxima atualização.</p>';
            return;
        }

        products.forEach(function (product: Product): void {
            productsList.appendChild(createProductCard(product));
        });
    }

    function updateLastUpdateBadge(meta?: { lastUpdate?: string }): void {
        const badge = document.getElementById('lastUpdateBadge') as HTMLElement | null;
        if (!badge || !meta || !meta.lastUpdate) return;

        const date: Date = new Date(meta.lastUpdate);
        const formatted: string = date.toLocaleString('pt-BR', {
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

    const GOOGLE_SCRIPT_URL: string = import.meta.env.VITE_GOOGLE_WEBAPP_URL_BESTSELLERS;

    async function loadProducts(): Promise<void> {
        const productsList = document.getElementById('productsList') as HTMLDivElement;
        productsList.innerHTML = '<p class="loading-state">⏳ Carregando produtos...</p>';

        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('undefined')) {
            console.error('❌ ERRO: URL do Google Script não encontrada nas variáveis de ambiente!');
            productsList.innerHTML = '<p class="error-state">❌ Erro de configuração: VITE_GOOGLE_WEBAPP_URL_BESTSELLERS não definida no .env ou servidor não reiniciado.</p>';
            return;
        }

        try {
            const response: Response = await fetch(GOOGLE_SCRIPT_URL);

            if (!response.ok) throw new Error('Falha ao carregar');

            const data: SheetResponse = await response.json();
            renderProducts(data.products || []);
            updateLastUpdateBadge(data.meta);
        } catch (error: unknown) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = '<p class="error-state">❌ Erro ao carregar produtos. Verifique a URL do Script.</p>';
        }
    }

    function init(): void {
        loadProducts();
    }

    return { init, renderProducts };
})();
