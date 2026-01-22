# Integração com Google Sheets - Produtos de Alta Comissão

## 📋 Visão Geral

Esta funcionalidade permite buscar automaticamente os produtos com maior comissão da Shopee e atualizar sua planilha do Google Sheets com os dados.

## 🚀 Como Usar

### 1. Iniciar o Servidor

Certifique-se de que o servidor Node.js está rodando:

```bash
npm start
```

O servidor deve estar rodando em `http://localhost:3000`

### 2. Acessar a Aplicação

Abra o arquivo `index.html` no navegador.

### 3. Buscar Produtos de Alta Comissão

1. Clique no botão **"💰 Buscar Maior Comissão e Atualizar Planilha"**
2. Aguarde enquanto o sistema:
   - Busca 200 produtos (4 páginas de 50 produtos cada)
   - Ordena por maior comissão (sortType: 2)
   - Prepara os dados no formato da planilha
3. Os dados serão automaticamente copiados para a área de transferência
4. A planilha será aberta em uma nova aba

### 4. Colar os Dados na Planilha

1. Na planilha aberta, clique na célula **A2** (primeira linha de dados, abaixo do cabeçalho)
2. Pressione **Ctrl+V** (ou Cmd+V no Mac) para colar
3. Os dados substituirão as linhas existentes

## 📊 Estrutura dos Dados

Os dados são organizados nas seguintes colunas:

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | id | Número sequencial (1, 2, 3...) |
| B | title | Nome do produto |
| C | price | Preço atual |
| D | original_price | Preço original (0 por padrão) |
| E | discount_percentage | Percentual de desconto (0 por padrão) |
| F | image_url | URL da imagem do produto |
| G | affiliate_url | Link de afiliado |
| H | category | Categoria (vazio por padrão) |
| I | active | Status ativo (TRUE) |
| J | sales | Vendas (vazio por padrão) |
| K | commission | Valor da comissão em R$ |

## 🔧 Detalhes Técnicos

### Endpoint da API Shopee

```
POST https://open-api.affiliate.shopee.com.br/graphql
```

### Query GraphQL

```graphql
query MaiorComissao($limite:Int,$pagina:Int){
  productOfferV2(limit:$limite,page:$pagina,sortType:2,listType:0){
    nodes{
      productName
      productLink
      offerLink
      price
      commission
      commissionRate
      imageUrl
      shopName
    }
  }
}
```

### Parâmetros

- **limite**: 50 produtos por página
- **pagina**: 0, 1, 2, 3 (total de 4 páginas = 200 produtos)
- **sortType**: 2 (ordenar por maior comissão)
- **listType**: 0 (lista padrão)

## 🔐 Autenticação

A autenticação é feita automaticamente pelo servidor usando:
- **APP_ID**: Configurado no arquivo `.env`
- **SECRET_KEY**: Configurado no arquivo `.env`
- **Assinatura SHA256**: Gerada automaticamente para cada requisição

## 📝 Link da Planilha

A planilha configurada é:
```
https://docs.google.com/spreadsheets/d/1Jm9nkz9SO4jeB5YX5JheSZ-RBFS6eWdtalHR1yHI6Pg/edit
```

Para usar uma planilha diferente, edite o `SHEET_ID` no arquivo `script.js`:

```javascript
const SHEET_ID = 'SEU_ID_AQUI';
```

## ⚠️ Observações

1. **Servidor Obrigatório**: O servidor Node.js deve estar rodando para que a funcionalidade funcione
2. **CORS**: O servidor está configurado com CORS habilitado para permitir requisições do frontend
3. **Rate Limiting**: Há um delay de 500ms entre cada página para evitar sobrecarga na API
4. **Permissões**: Certifique-se de ter permissão de edição na planilha do Google Sheets
5. **Navegador**: A funcionalidade de copiar para área de transferência requer um navegador moderno

## 🐛 Solução de Problemas

### "Erro ao buscar produtos. Verifique se o servidor está rodando."

- Certifique-se de que o servidor está rodando em `http://localhost:3000`
- Verifique se as credenciais no arquivo `.env` estão corretas

### "Nenhum produto encontrado!"

- Verifique sua conexão com a internet
- Confirme se as credenciais da API Shopee estão válidas

### Dados não colam corretamente na planilha

- Certifique-se de clicar na célula A2 antes de colar
- Verifique se você tem permissão de edição na planilha
- Tente usar Ctrl+Shift+V para colar sem formatação

## 📞 Suporte

Para mais informações sobre a API da Shopee, consulte a documentação oficial:
https://open.shopee.com/documents/v1/v1.affiliate.product_basic_info
