# Shopee Best-Sellers Story Generator 📸

Ferramenta web para afiliados da Shopee que auto-gera cards dos 25 produtos mais vendidos e permite criar imagens profissionais para Instagram Stories com um toque.

## 🚀 Como Funciona

1. **Automação Diária**: Um cron job busca os 25 produtos mais vendidos da Shopee todos os dias e atualiza uma planilha Google.
2. **Auto-Load**: Ao abrir o site, ele lê os dados direto da planilha (via Google Apps Script).
3. **Gerador de Stories**: Ao clicar em um produto, um card 1080x1920 é gerado via Canvas API.
4. **Share Nativo**: No mobile, abre a bandeja de compartilhamento do sistema para postar direto no Instagram.

## 🛠️ Configuração do Google Sheets (Integração)

Siga este passo a passo para conectar sua planilha:

### 1. Planilha
- Crie uma planilha no Google Sheets.
- Aba 1: Nomeie como `Produtos`. Colunas (linha 1): `productName`, `offerLink`, `price`, `imageUrl`.
- Aba 2: Nomeie como `Meta`. Célula A1: `Quantidade`, A2: `Última Atualização`.

### 2. Apps Script
- Na planilha: **Extensões > Apps Script**.
- Cole o código abaixo:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = sheet.getSheetByName('Produtos');
  var metaSheet = sheet.getSheetByName('Meta');
  var data = JSON.parse(e.postData.contents);

  if (prodSheet.getLastRow() > 1) {
    prodSheet.getRange(2, 1, prodSheet.getLastRow() - 1, 4).clearContent();
  }

  if (data.rows && data.rows.length > 0) {
    prodSheet.getRange(2, 1, data.rows.length, data.rows[0].length).setValues(data.rows);
  }

  if (data.meta) {
    metaSheet.getRange('B1').setValue(data.meta.count);
    metaSheet.getRange('B2').setValue(data.meta.lastUpdate);
  }

  return ContentService.createTextOutput(JSON.stringify({result:'success'})).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = sheet.getSheetByName('Produtos');
  var metaSheet = sheet.getSheetByName('Meta');
  var lastRow = prodSheet.getLastRow();
  var products = [];

  if (lastRow > 1) {
    var data = prodSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    products = data.map(r => ({ productName: r[0], offerLink: r[1], price: r[2], imageUrl: r[3] }));
  }

  var meta = { count: metaSheet.getRange('B1').getValue(), lastUpdate: metaSheet.getRange('B2').getValue() };
  return ContentService.createTextOutput(JSON.stringify({ products, meta })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy
- Clique em **Implantar > Nova implantação**.
- Tipo: **Aplicativo da Web**.
- Quem pode acessar: **Qualquer pessoa**.
- Copie a URL gerada e coloque no seu `.env` como `GOOGLE_WEBAPP_URL_BESTSELLERS`.

## 📂 Estrutura

- `src/cron/updateBestSellers.js`: Script que roda no GitHub Actions.
- `src/server.js`: Proxy que conecta o frontend à planilha sem expor a URL da planilha.
- `public/`: Interface ultra-rápida focada em conversão.

## 🤖 GitHub Actions
O workflow `update-bestsellers.yml` roda diariamente às 11:40 BRT. Certifique-se de configurar os Secrets no repositório:
- `SHOPEE_APP_ID`
- `SHOPEE_SECRET_KEY`
- `GOOGLE_WEBAPP_URL_BESTSELLERS`
