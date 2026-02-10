# Shopee Promotion Message Generator

Ferramenta web para afiliados da Shopee que gera mensagens promocionais para WhatsApp e imagens para Instagram Stories.

## 🚀 Funcionalidades

- **Gerador de Mensagens para WhatsApp** — preencha dados ou cole JSON para gerar mensagens formatadas
- **Importação via JSON** — suporta dados da API de Afiliados da Shopee
- **Story Generator para Instagram** — gera imagens 1080×1920 via Canvas API com compartilhamento nativo mobile
- **Integração Google Sheets** — sincroniza produtos de alta comissão com sua planilha
- **Automação GitHub Actions** — atualização automática semanal da planilha

## 🛠️ Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+, modular IIFE)
- **Backend**: Node.js, Express, Axios, CryptoJS
- **Design**: Fonte Outfit, Glassmorphism, Gradientes

## 📂 Estrutura

```
wa-me-generator/
├── src/                          # Backend
│   ├── shopee/shopeeClient.js    # Cliente API Shopee (autenticação + fetch)
│   ├── sheets/sheetsService.js   # Serviço Google Sheets
│   ├── server.js                 # Servidor Express
│   └── cron/updateSheets.js      # Script de atualização automática
├── public/                       # Frontend
│   ├── index.html                # Página principal
│   ├── style.css                 # Estilos
│   └── js/
│       ├── main.js               # Ponto de entrada
│       ├── form.js               # Formulário e mensagens
│       ├── productCards.js       # Cards de produtos
│       ├── storyCanvas.js        # Geração de imagens Canvas
│       └── share.js              # Compartilhamento mobile/download
├── .github/workflows/            # CI/CD
├── .editorconfig                 # Padrões de formatação
├── .env.example                  # Template de variáveis de ambiente
└── package.json
```

## 📋 Como Usar

1. Configure o `.env` a partir do `.env.example`
2. Execute `npm install`
3. Execute `npm start`
4. Acesse `http://localhost:3000`

## 🤖 Automação

Toda sexta-feira às 05:30 (BRT), o GitHub Actions busca produtos de alta comissão e atualiza a planilha.

**Secrets necessários**: `SHOPEE_APP_ID`, `SHOPEE_SECRET_KEY`, `GOOGLE_WEBAPP_URL`

Execução manual disponível via GitHub Actions UI.

---
Desenvolvido para **Itambé Promoções**.
