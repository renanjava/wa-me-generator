export const Share = (function() {

    async function shareImage(blob) {
        var file = new File([blob], 'story-promocao.png', { type: 'image/png' });

        if (!navigator.share) {
            alert('Seu navegador não suporta compartilhamento. Use o Chrome atualizado.');
            return false;
        }

        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
            alert('Seu navegador não suporta compartilhamento de imagens. Atualize o Chrome.');
            return false;
        }

        await navigator.share({
            files: [file]
        });

        return true;
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.warn('Não foi possível copiar:', err);
        }
    }

    return { shareImage, copyToClipboard };
})();
