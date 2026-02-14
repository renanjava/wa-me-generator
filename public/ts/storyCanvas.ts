import type { Product, FormResult } from './types';
import { Share } from './share';

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
): void {
    const words: string[] = text.split(' ');
    let line: string = '';
    let lineCount: number = 1;

    for (let n: number = 0; n < words.length; n++) {
        const testLine: string = line + words[n] + ' ';
        const testWidth: number = ctx.measureText(testLine).width;

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

function drawArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
): void {
    const headlen = 20; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

export async function drawStory(
    canvas: HTMLCanvasElement,
    product: Product,
    priceStr: string
): Promise<void> {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Fundo Limpo e Vibrante (Gradiente Moderno)
    const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#5b2f91'); // Roxo vibrante
    gradient.addColorStop(1, '#2f1c54'); // Roxo escuro
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Efeitos de fundo (Círculos sutis para dar profundidade)
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(W, 0, 400, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, H, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2. Header "Itambé Promoções"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 70px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("📢 Itambé Promoções", W/2, 150);
    ctx.shadowBlur = 0;


    // 3. Card do Produto
    const cardW = 900;
    const cardH = 1200;
    const cardX = (W - cardW) / 2;
    const cardY = 250; // Mantendo posição Y

    // Sombra do card
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    
    ctx.fillStyle = '#FFFFFF';
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 50);
        ctx.fill();
    } else {
        ctx.fillRect(cardX, cardY, cardW, cardH);
    }
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Imagem do Produto
    let imgLoaded = false;
    try {
        const img: HTMLImageElement = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>(function (resolve, reject) {
            img.onload = (): void => resolve();
            img.onerror = reject;
            img.src = product.imageUrl || '';
        });

        const imgMargin = 60;
        const imgAreaW = cardW - (imgMargin * 2);
        const imgAreaH = cardH - 500; // Espaço para texto e preço abaixo
        const imgAreaX = cardX + imgMargin;
        const imgAreaY = cardY + imgMargin;

        const scale: number = Math.min(imgAreaW / img.width, imgAreaH / img.height);
        const w: number = img.width * scale;
        const h: number = img.height * scale;
        const x: number = imgAreaX + (imgAreaW - w) / 2;
        const y: number = imgAreaY + (imgAreaH - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        imgLoaded = true;
    } catch (e: unknown) {
        console.warn('Erro ao carregar imagem:', e);
    }

    if (!imgLoaded) {
         ctx.fillStyle = '#e5e5e5';
         ctx.fillRect(cardX + 50, cardY + 50, cardW - 100, cardH - 550);
         ctx.fillStyle = '#999';
         ctx.font = '30px Poppins, sans-serif';
         ctx.textAlign = 'center';
         ctx.fillText("Sem imagem", W/2, cardY + 300);
    }

    // 5. Detalhes do Produto (Nome e Preço)
    ctx.textAlign = 'center';
    
    // Nome do Produto
    ctx.fillStyle = '#333333';
    ctx.font = '600 42px "Outfit", "Segoe UI", sans-serif';
    wrapText(ctx, product.productName, W/2, cardY + cardH - 420, cardW - 80, 50, 2);

    // Divisor
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + cardH - 280);
    ctx.lineTo(cardX + cardW - 50, cardY + cardH - 280);
    ctx.stroke();

    // Texto "Oferta Imperdível"
    ctx.fillStyle = '#666';
    ctx.font = '500 30px "Outfit", sans-serif';
    ctx.fillText("🛒 OFERTA IMPERDÍVEL", W/2, cardY + cardH - 220);

    // Preço
    ctx.fillStyle = '#ef4444'; // Vermelho preço
    ctx.font = '800 110px "Outfit", sans-serif';
    ctx.fillText(`R$ ${priceStr}`, W/2, cardY + cardH - 80);

    // 6. Badge "🔥 SÓ HOJE!"
    const badgeW = 350;
    const badgeH = 120;
    const badgeX = W - badgeW - 60;
    const badgeY = cardY - 60;

    ctx.save();
    ctx.translate(badgeX + badgeW/2, badgeY + badgeH/2);
    ctx.rotate(5 * Math.PI / 180);

    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(-badgeW/2, -badgeH/2, badgeW, badgeH, 20);
    } else {
        ctx.rect(-badgeW/2, -badgeH/2, badgeW, badgeH);
    }
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 50px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🔥 SÓ HOJE!", 0, 5);
    
    ctx.restore();

    // 7. Área Inferior: CTA e Espaço para Link
    // Ajustado posição para cima conforme solicitado
    const footerY = cardY + cardH + 50; // Começa 50px abaixo do card (card termina em 1450) -> 1500

    // Texto "Promoção válida apenas Hoje"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 45px "Outfit", sans-serif';
    ctx.textAlign = 'center'; 
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText("⚠️ Promoção válida apenas para Hoje", W/2, footerY);
    ctx.shadowBlur = 0;

    // Setas Animadas
    const arrowStartY = footerY + 30; // 1530
    const arrowCenterX = W/2;
    
    // Desenhar 3 setas apontando para o botão
    drawArrow(ctx, arrowCenterX, arrowStartY, arrowCenterX, arrowStartY + 70);
    drawArrow(ctx, arrowCenterX - 100, arrowStartY, arrowCenterX - 70, arrowStartY + 50);
    drawArrow(ctx, arrowCenterX + 100, arrowStartY, arrowCenterX + 70, arrowStartY + 50);

    // Botão Branco (Placeholder Link)
    const btnW = 600;
    const btnH = 140; 
    const btnX = (W - btnW) / 2;
    const btnY = arrowStartY + 90; // 1530 + 90 = 1620 (Botão termina em 1760. Espaço seguro do fim da tela)

    // Efeito de "Brilho" atrás do botão
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
    ctx.shadowBlur = 40;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(btnX, btnY, btnW, btnH, 70);
    } else {
        ctx.fillRect(btnX, btnY, btnW, btnH);
    }
    ctx.fill();
    
    // Sem texto dentro do botão (placeholder removido)
}

export const StoryCanvas = (function () {

    async function generate(product: Product, formattedData: FormResult): Promise<boolean | undefined> {
        const canvas = document.getElementById('storyCanvas') as HTMLCanvasElement;
        const priceStr: string = formattedData.data?.precoAtualStr ?? '';

        await drawStory(canvas, product, priceStr);

        return new Promise<boolean | undefined>(function (resolve, reject) {
            canvas.toBlob(async function (blob: Blob | null): Promise<void> {
                if (!blob) {
                    reject(new Error('Canvas to Blob falhou'));
                    return;
                }
                const result: boolean = await Share.shareImage(blob);
                resolve(result);
            }, 'image/png');
        });
    }

    return { generate };
})();
