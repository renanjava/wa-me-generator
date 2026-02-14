import type { Product, FormResult } from './types';
import { Share } from './share';

export const StoryCanvas = (function () {
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

    async function generate(product: Product, formattedData: FormResult): Promise<boolean | undefined> {
        const canvas = document.getElementById('storyCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = 1080;
        canvas.height = 1920;

        const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, 0, 1920);
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

        const cardY: number = 320;
        const cardHeight: number = 1200;
        const cardWidth: number = 1000;
        const cardX: number = (1080 - cardWidth) / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 40);
        ctx.fill();

        try {
            const img: HTMLImageElement = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>(function (resolve, reject) {
                img.onload = (): void => resolve();
                img.onerror = reject;
                img.src = product.imageUrl || '';
            });

            const imgAreaMargin: number = 30;
            const imgAreaW: number = cardWidth - (imgAreaMargin * 2);
            const imgAreaH: number = cardHeight - 380;
            const imgAreaX: number = cardX + imgAreaMargin;
            const imgAreaY: number = cardY + imgAreaMargin;
            const scale: number = Math.min(imgAreaW / img.width, imgAreaH / img.height);
            const w: number = img.width * scale;
            const h: number = img.height * scale;
            const x: number = imgAreaX + (imgAreaW - w) / 2;
            const y: number = imgAreaY + (imgAreaH - h) / 2;
            ctx.drawImage(img, x, y, w, h);
        } catch (e: unknown) {
            console.warn('Erro ao carregar imagem do produto:', e);
            ctx.fillStyle = '#cccccc';
            ctx.font = '40px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Imagem indisponível", 540, cardY + 400);
        }

        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.font = '600 48px Outfit, sans-serif';
        wrapText(ctx, product.productName, 540, cardY + cardHeight - 270, cardWidth - 80, 55, 2);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 110px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('R$ ' + (formattedData.data?.precoAtualStr ?? ''), 540, cardY + cardHeight - 80);

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
