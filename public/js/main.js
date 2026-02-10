document.addEventListener('DOMContentLoaded', function() {
    App.Form.init();
    App.ProductCards.init();

    var btnSend = document.getElementById('btnSend');
    if (btnSend) {
        btnSend.addEventListener('click', function() {
            var result = App.Form.getFormattedText();
            if (result.valid) {
                var url = 'https://wa.me/5544988602881?text=' + encodeURIComponent(result.wa);
                window.open(url, '_blank');
                App.Form.resetForm();
            }
        });
    }
});
