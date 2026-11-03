/**
 * POMAROLI — Isca digital do quiz PC MG (Raio X do último edital)
 * Salva e-mail + telefone em uma planilha do Google Sheets.
 *
 * COMO INSTALAR:
 * 1. Abra sheets.google.com → crie uma planilha (ex.: "Leads Quiz PC MG").
 * 2. Extensões → Apps Script.
 * 3. Cole TODO este código em Code.gs → Salvar.
 * 4. Implantação → Nova implantação → tipo "Aplicativo da Web":
 *    - Executar: doPost
 *    - Quem tem acesso: Qualquer pessoa
 * 5. Copie a URL gerada (…/exec).
 * 6. No quiz.html, cole a URL em LEAD_ENDPOINT (topo do <script>).
 * 7. Teste uma vez no quiz e confira a aba "Leads" na planilha.
 */

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads");
    if (!sheet) sheet = ss.insertSheet("Leads");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Data", "E-mail", "Telefone", "Origem", "Navegador"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }

    var payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      payload = {};
    }

    sheet.appendRow([
      new Date(),
      String(payload.email || ""),
      String(payload.phone || ""),
      String(payload.source || "quiz-pcmg-raiox"),
      String(payload.ua || "")
    ]);

    lock.releaseLock();

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
