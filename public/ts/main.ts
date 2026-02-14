import { Form } from './form';
import { ProductCards } from './productCards';
import { renderPreview } from './storyPreview';

document.addEventListener('DOMContentLoaded', function (): void {
    Form.init();
    ProductCards.init();
    renderPreview();
});
