# 📸 Guia Visual - Buscar Produtos de Alta Comissão

## 🎯 Visão Geral

Este guia mostra passo a passo como usar a funcionalidade de busca de produtos com maior comissão e atualização automática da planilha Google Sheets.

## 🖼️ Estados do Botão

O botão possui três estados visuais que indicam o progresso da operação:

### 1️⃣ Estado Normal (Pronto para usar)
```
┌────────────────────────────────────────────────┐
│ 💰 Buscar Maior Comissão e Atualizar Planilha  │
└────────────────────────────────────────────────┘
```
- **Cor**: Verde (#10b981)
- **Ação**: Clique para iniciar a busca

### 2️⃣ Estado de Carregamento (Buscando)
```
┌────────────────────────────────────────────────┐
│ ⏳ Buscando produtos...                         │
└────────────────────────────────────────────────┘
```
- **Cor**: Verde (#10b981)
- **Status**: Botão desabilitado
- **Ação**: Aguarde enquanto busca 200 produtos

### 3️⃣ Estado de Atualização (Processando)
```
┌────────────────────────────────────────────────┐
│ ⏳ Atualizando planilha...                      │
└────────────────────────────────────────────────┘
```
- **Cor**: Verde (#10b981)
- **Status**: Botão desabilitado
- **Ação**: Aguarde enquanto prepara os dados

### 4️⃣ Estado de Sucesso (Concluído)
```
┌────────────────────────────────────────────────┐
│ ✅ Concluído!                                   │
└────────────────────────────────────────────────┘
```
- **Cor**: Verde (#10b981)
- **Status**: Botão desabilitado temporariamente
- **Ação**: Retorna ao estado normal após 3 segundos

## 📋 Passo a Passo Completo

### Passo 1: Iniciar o Servidor
```bash
cd wa-me-generator
npm start
```

**Saída esperada:**
```
🚀 Servidor rodando em http://localhost:3000
👉 Certifique-se de preencher o arquivo .env com suas credenciais.
```

### Passo 2: Abrir a Aplicação
1. Abra o arquivo `index.html` no navegador
2. Localize a seção "📱 Prévia da Mensagem"
3. Role até encontrar o botão verde

### Passo 3: Clicar no Botão
1. Clique em "💰 Buscar Maior Comissão e Atualizar Planilha"
2. O botão mudará para "⏳ Buscando produtos..."
3. Aguarde aproximadamente 5-10 segundos

### Passo 4: Aguardar a Busca
Durante este processo, o sistema:
- ✅ Faz 4 requisições à API da Shopee
- ✅ Busca 50 produtos por requisição
- ✅ Total: 200 produtos com maior comissão
- ✅ Aguarda 500ms entre cada requisição

### Passo 5: Preparação dos Dados
O botão mudará para "⏳ Atualizando planilha..."
- ✅ Formata os dados no padrão da planilha
- ✅ Copia para a área de transferência
- ✅ Abre a planilha em nova aba

### Passo 6: Alerta de Sucesso
Você verá um alerta com as instruções:

```
✅ 200 produtos encontrados!

Os dados foram copiados para a área de transferência.

Instruções:
1. A planilha será aberta em uma nova aba
2. Selecione a célula A2 (primeira linha de dados)
3. Cole os dados (Ctrl+V)
4. Os dados substituirão as linhas existentes
```

### Passo 7: Colar na Planilha
1. A planilha abrirá automaticamente em nova aba
2. Clique na célula **A2** (primeira linha abaixo do cabeçalho)
3. Pressione **Ctrl+V** (Windows) ou **Cmd+V** (Mac)
4. Os dados serão colados em formato tabular

### Passo 8: Verificar os Dados
Confira se os dados foram colados corretamente:
- ✅ Coluna A: IDs sequenciais (1, 2, 3...)
- ✅ Coluna B: Nomes dos produtos
- ✅ Coluna C: Preços
- ✅ Coluna F: URLs das imagens
- ✅ Coluna G: Links de afiliado
- ✅ Coluna K: Valores de comissão

## 🎨 Localização do Botão na Interface

```
┌─────────────────────────────────────────────────────┐
│  📱 Prévia da Mensagem                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Área de prévia da mensagem]                        │
│                                                      │
├─────────────────────────────────────────────────────┤
│  Cole o JSON da Shopee aqui:                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ {"data": ...}                                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📂 Carregar Produtos                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 💰 Buscar Maior Comissão e Atualizar Planilha  │ │ ← NOVO!
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Lista de produtos]                                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 📊 Exemplo de Dados Retornados

### Formato JSON da API:
```json
{
  "data": {
    "productOfferV2": {
      "nodes": [
        {
          "productName": "Fone De Ouvido Bluetooth E6S TWS 5.0",
          "productLink": "https://shopee.com.br/product/988199054/23491414506",
          "offerLink": "https://s.shopee.com.br/5figbmIoOP",
          "price": "19.99",
          "commission": "1.5992",
          "commissionRate": "0.08",
          "imageUrl": "https://cf.shopee.com.br/file/cn-11134207-7r98o-lwmnsjet29lv6f",
          "shopName": "linda.br"
        }
      ]
    }
  }
}
```

### Formato na Planilha (TSV):
```
1	Fone De Ouvido Bluetooth E6S TWS 5.0	19.99	0	0	https://cf.shopee.com.br/file/cn-11134207-7r98o-lwmnsjet29lv6f	https://s.shopee.com.br/5figbmIoOP		TRUE		1.5992
```

## ⚠️ Possíveis Problemas e Soluções

### ❌ "Erro ao buscar produtos. Verifique se o servidor está rodando."

**Causa:** Servidor não está rodando ou não está acessível

**Solução:**
1. Abra um terminal
2. Navegue até a pasta do projeto
3. Execute `npm start`
4. Aguarde a mensagem "🚀 Servidor rodando em http://localhost:3000"

### ❌ "Nenhum produto encontrado!"

**Causa:** API da Shopee não retornou produtos

**Solução:**
1. Verifique sua conexão com a internet
2. Confirme se as credenciais no `.env` estão corretas
3. Tente novamente após alguns minutos

### ❌ Dados não colam corretamente

**Causa:** Célula errada selecionada ou formato incorreto

**Solução:**
1. Certifique-se de clicar na célula **A2** (não A1)
2. Use Ctrl+V (não Ctrl+Shift+V)
3. Se não funcionar, tente Ctrl+Shift+V para colar sem formatação

### ❌ Planilha não abre automaticamente

**Causa:** Bloqueador de pop-ups ativo

**Solução:**
1. Permita pop-ups para o site
2. Ou abra manualmente: https://docs.google.com/spreadsheets/d/1Jm9nkz9SO4jeB5YX5JheSZ-RBFS6eWdtalHR1yHI6Pg/edit

## 🔄 Fluxo Completo (Diagrama)

```
┌─────────────────┐
│ Usuário clica   │
│ no botão verde  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend envia  │
│ POST request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend busca   │
│ Página 0 (1-50) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aguarda 500ms   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend busca   │
│ Página 1 (51-100)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aguarda 500ms   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend busca   │
│ Página 2 (101-150)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aguarda 500ms   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend busca   │
│ Página 3 (151-200)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend formata│
│ dados em TSV    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Copia para      │
│ clipboard       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Abre planilha   │
│ em nova aba     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mostra alerta   │
│ com instruções  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Usuário cola    │
│ na célula A2    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Concluído!   │
│ 200 produtos    │
│ atualizados     │
└─────────────────┘
```

## 🎯 Dicas e Boas Práticas

1. **Sempre inicie o servidor antes** de usar a funcionalidade
2. **Aguarde o processo completo** - não feche a aba durante a busca
3. **Verifique a célula A2** antes de colar
4. **Mantenha um backup** da planilha antes de atualizar
5. **Use em horários de menor tráfego** para melhor performance da API

## 📞 Informações Adicionais

- **Tempo médio de execução**: 5-10 segundos
- **Produtos retornados**: 200 (fixo)
- **Ordenação**: Por maior comissão
- **Formato de saída**: TSV (Tab-Separated Values)
- **Compatibilidade**: Chrome, Firefox, Edge, Safari (versões recentes)
