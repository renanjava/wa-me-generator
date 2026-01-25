# Shopee Promotion Message Generator

Este projeto é uma ferramenta web para afiliados da Shopee que desejam gerar rapidamente mensagens promocionais formatadas para WhatsApp e imagens atraentes para Instagram Stories.

## 🚀 Funcionalidades

- **Gerador de Mensagens para WhatsApp**: Preencha os dados do produto ou cole um JSON da Shopee para gerar automaticamente mensagens formatadas (negrito, itálico, preços, links).
- **Importação via JSON**: Suporta a importação direta de dados de produtos através do formato JSON da API de Afiliados da Shopee.
- **Story Generator para Instagram**: Gera imagens personalizadas (1080x1920px) em tempo real usando HTML5 Canvas, incluindo:
    - Fundo gradiente moderno com alto contraste.
    - Card de produto com sombra e imagem centralizada.
    - Preço em destaque (antigo riscado e atual em vermelho).
    - Nome do produto com quebra de linha inteligente.
    - Indicadores visuais (setas) para colagem de links no Instagram.
- **Copy to Clipboard**: Copia automaticamente os links para a área de transferência ao clicar no botão de Instagram.
- **Integração com Web Share API**: Compartilhamento nativo de imagens em dispositivos móveis ou download automático em desktops.
- **Backend Node.js**: Servidor Express opcional para integrar diretamente com a API de Afiliados da Shopee.
- **🤖 Automação GitHub Actions**: Atualização automática diária da planilha às 22:00 (horário de Brasília).

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Design**: Fonte "Outfit" do Google Fonts, Glassmorphism, Gradientes Dinâmicos.
- **Gráficos**: HTML5 Canvas API para geração de imagens sob demanda.
- **Backend**: Node.js, Express, Axios, CryptoJS.
- **Segurança**: Variáveis de ambiente com `dotenv` para proteção de chaves de API.

## 📂 Estrutura do Projeto

- `index.html`: Estrutura principal da aplicação.
- `script.js`: Lógica de processamento de dados, formatação de mensagens e geração de canvas.
- `style.css`: Estilização completa do layout responsivo e moderno.
- `server.js`: Servidor para ponte com a API oficial da Shopee (opcional).
- `.env`: Arquivo de configuração de credenciais (deve ser criado localmente).

## 📋 Como Usar

1. **Localmente**: Basta abrir o arquivo `index.html` em qualquer navegador moderno.
2. **Importação**: Cole o JSON retornado pela API da Shopee no campo indicado ou preencha os campos manualmente.
3. **Compartilhamento**:
    - Clique no ícone do **WhatsApp** para abrir o app com o texto pronto.
    - Clique no ícone do **Instagram** para copiar os links, gerar a imagem e abrir as opções de compartilhamento (ou baixar a imagem).

## 🤖 Automação

Este projeto possui automação via GitHub Actions que atualiza a planilha automaticamente todos os dias às 22:00.

📖 **[Leia a documentação completa de automação](README_AUTOMACAO.md)**

Para configurar:
1. Configure os Secrets no GitHub (SHOPEE_APP_ID, SHOPEE_SECRET_KEY, GOOGLE_WEBAPP_URL)
2. Faça push do código para o repositório
3. A automação executará automaticamente no horário configurado

Você também pode executar manualmente via GitHub Actions UI.

---
Desenvolvido para **Itambé Promoções**.
