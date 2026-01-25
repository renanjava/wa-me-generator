/**
 * Google Apps Script para receber dados da automação
 * 
 * Este script deve ser implantado como Web App no Google Apps Script
 * para receber automaticamente os produtos do GitHub Actions.
 * 
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 
 * 1. Acesse https://script.google.com/
 * 2. Crie um novo projeto
 * 3. Cole este código
 * 4. Configure a planilha de destino (veja abaixo)
 * 5. Deploy como Web App:
 *    - Clique em "Deploy" → "New deployment"
 *    - Tipo: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (ou sua conta específica)
 *    - Clique em "Deploy"
 * 6. Copie a URL gerada e use como GOOGLE_WEBAPP_URL
 */

// ========================================
// CONFIGURAÇÃO - EDITE AQUI
// ========================================

// ID da sua planilha do Google Sheets
// Para encontrar: abra a planilha e copie o ID da URL
// Exemplo: https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
const SPREADSHEET_ID = '1Jm9nkz9SO4jeB5YX5JheSZ-RBFS6eWdtalHR1yHI6Pg';

// Nome da aba/página onde os dados serão inseridos
const SHEET_NAME = 'Produtos';

// ========================================
// CÓDIGO PRINCIPAL - NÃO EDITE
// ========================================

/**
 * Função chamada quando o Web App recebe uma requisição POST
 */
function doPost(e) {
  try {
    // Parse do JSON recebido
    const data = JSON.parse(e.postData.contents);
    
    if (!data.rows || !Array.isArray(data.rows)) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          result: 'error', 
          error: 'Formato inválido: esperado { rows: [[...]] }' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Abre a planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Se a aba não existir, cria uma nova
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Adiciona cabeçalhos
      sheet.getRange(1, 1, 1, 4).setValues([[
        'Nome do Produto',
        'Link de Afiliado',
        'Preço',
        'URL da Imagem'
      ]]);
      
      // Formata cabeçalhos
      sheet.getRange(1, 1, 1, 4)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');
    }
    
    // Limpa dados antigos (mantém o cabeçalho)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
    }
    
    // Insere novos dados
    if (data.rows.length > 0) {
      sheet.getRange(2, 1, data.rows.length, 4).setValues(data.rows);
    }
    
    // Formata a coluna de preço como moeda
    sheet.getRange(2, 3, data.rows.length, 1)
      .setNumberFormat('R$ #,##0.00');
    
    // Ajusta largura das colunas
    sheet.autoResizeColumns(1, 4);
    
    // Adiciona informações de atualização na aba "Meta"
    updateMetadata(spreadsheet, data.rows.length);
    
    // Retorna sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: 'success', 
        message: `${data.rows.length} produtos atualizados com sucesso!`,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retorna erro
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: 'error', 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Atualiza a aba "Meta" com informações da última atualização
 */
function updateMetadata(spreadsheet, productCount) {
  let metaSheet = spreadsheet.getSheetByName('Meta');
  
  // Se a aba Meta não existir, cria
  if (!metaSheet) {
    metaSheet = spreadsheet.insertSheet('Meta');
    
    // Cabeçalhos
    metaSheet.getRange(1, 1, 1, 2).setValues([['Informação', 'Valor']]);
    metaSheet.getRange(1, 1, 1, 2)
      .setFontWeight('bold')
      .setBackground('#34a853')
      .setFontColor('#ffffff');
  }
  
  // Atualiza informações
  const now = new Date();
  const brazilTime = Utilities.formatDate(now, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
  
  metaSheet.getRange(2, 1, 4, 2).setValues([
    ['Última Atualização', brazilTime],
    ['Total de Produtos', productCount],
    ['Status', 'Atualizado com sucesso ✅'],
    ['Fonte', 'GitHub Actions (Automação)']
  ]);
  
  metaSheet.autoResizeColumns(1, 2);
}

/**
 * Função de teste (opcional)
 * Execute esta função manualmente para testar se o script está funcionando
 */
function testScript() {
  const testData = {
    rows: [
      ['Produto Teste 1', 'https://exemplo.com/1', 99.90, 'https://exemplo.com/img1.jpg'],
      ['Produto Teste 2', 'https://exemplo.com/2', 149.90, 'https://exemplo.com/img2.jpg'],
      ['Produto Teste 3', 'https://exemplo.com/3', 199.90, 'https://exemplo.com/img3.jpg']
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
