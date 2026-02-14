import type { Product } from './types';
import { drawStory } from './storyCanvas';

const DUMMY_PRODUCT: Product = {
    productName: 'Kit Exemplo de Produto Shopee com Desconto Especial',
    offerLink: 'https://s.shopee.com.br/exemplo',
    price: 49.99,
    imageUrl: ''
};

const DUMMY_PRICE_STR: string = '49,99';

export async function renderPreview(): Promise<void> {
    const canvas = document.getElementById('storyPreviewCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    await drawStory(canvas, DUMMY_PRODUCT, DUMMY_PRICE_STR);
}
