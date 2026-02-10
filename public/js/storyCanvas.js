var App = App || {};

App.StoryCanvas = (function() {
    function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
        var words = text.split(' ');
        var line = '';
        var lineCount = 1;

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var testWidth = ctx.measureText(testLine).width;

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

    async function generate(product, formattedData) {
        var canvas = document.getElementById('storyCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 1080;
        canvas.height = 1920;

        var gradient = ctx.createLinearGradient(0, 0, 0, 1920);
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

        var cardY = 320;
        var cardHeight = 1200;
        var cardWidth = 1000;
        var cardX = (1080 - cardWidth) / 2;
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
            var img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise(function(resolve, reject) {
                img.onload = resolve;
                img.onerror = reject;
                img.src = product.imageUrl;
            });

            var imgAreaMargin = 30;
            var imgAreaW = cardWidth - (imgAreaMargin * 2);
            var imgAreaH = cardHeight - 380;
            var imgAreaX = cardX + imgAreaMargin;
            var imgAreaY = cardY + imgAreaMargin;
            var scale = Math.min(imgAreaW / img.width, imgAreaH / img.height);
            var w = img.width * scale;
            var h = img.height * scale;
            var x = imgAreaX + (imgAreaW - w) / 2;
            var y = imgAreaY + (imgAreaH - h) / 2;
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
        wrapText(ctx, product.productName, 540, cardY + cardHeight - 270, cardWidth - 80, 55, 2);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 110px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('R$ ' + formattedData.data.precoAtualStr, 540, cardY + cardHeight - 80);

        return new Promise(function(resolve, reject) {
            canvas.toBlob(async function(blob) {
                if (!blob) {
                    reject(new Error('Canvas to Blob falhou'));
                    return;
                }
                var result = await App.Share.shareImage(blob);
                resolve(result);
            }, 'image/png');
        });
    }

    return { generate };
})();
