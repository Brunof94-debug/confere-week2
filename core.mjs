export function moneyToCents(value) {
  const raw = String(value).trim().replace(/R\$|BRL|\s/g, '');
  if (!raw || !/^[\d.,]+$/.test(raw)) return null;
  let normalized = raw;
  if (raw.includes(',')) {
    if (!/^\d{1,3}(?:\.\d{3})*,\d{2}$|^\d+,\d{2}$/.test(raw)) return null;
    normalized = raw.replaceAll('.', '').replace(',', '.');
  } else if (!/^\d+(?:\.\d{2})?$/.test(raw)) return null;
  const [whole, fraction = '00'] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction);
  return Number.isSafeInteger(cents) && cents <= 99999999999 ? cents : null;
}
export const formatAmount = cents => cents == null ? '' : `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;
export const formatMoney = cents => new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(cents / 100);
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function parseReceipt(text) {
  const unsupportedCurrency = /\b(?:USD|EUR|GBP|JPY|CAD|AUD)\b|[€£¥]|(?<!R)\$/.test(text);
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const candidates = [];
  for (const [i, line] of lines.entries()) {
    // A final total needs an explicit label. Never treat subtotal, tender or change as total.
    if (!/(?:^|\b)(?:TOTAL(?:\s+(?:A\s+PAGAR|PAGO|GERAL))?|VALOR\s+(?:TOTAL|PAGO))\b/i.test(line) || /SUB\s*TOTAL|TROCO|DESCONTO|DINHEIRO\s+RECEBIDO/i.test(line)) continue;
    const rest = line.replace(/^.*?(?:TOTAL(?:\s+(?:A\s+PAGAR|PAGO|GERAL))?|VALOR\s+(?:TOTAL|PAGO))\b/i, '');
    for (const match of rest.matchAll(/(?<![\d.,])(?:\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}|\d+\.\d{2})(?![\d.,])/g)) {
      const cents = moneyToCents(match[0]);
      if (cents != null) candidates.push({cents, line, lineIndex:i});
    }
    if (!/\d/.test(rest) && lines[i+1] && /^(?:R\$\s*)?\d+[.,]\d{2}$/.test(lines[i+1])) {
      const cents = moneyToCents(lines[i+1]);
      if (cents != null) candidates.push({cents, line:`${line} ${lines[i+1]}`, lineIndex:i});
    }
  }
  const distinct = [...new Set(candidates.map(c => c.cents))];
  const dateMatch = text.match(/\b(\d{2})[/-](\d{2})[/-](\d{4})\b/);
  const date = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : '';
  const merchant = lines.find(l => !/AMOSTRA|SAMPLE|FICT[IÍ]CIO|COMPROVANTE|RECIBO|CUPOM|DEMONSTRA/i.test(l)) || '';
  return {merchant:merchant.slice(0,100), date:validDate(date) ? date : '', cents:distinct.length === 1 && !unsupportedCurrency ? distinct[0] : null, candidates, ambiguous:distinct.length > 1, unsupportedCurrency};
}
const normalizedMerchant = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function duplicateOf(record, records) {
  return records.find(other => other.id !== record.id && other.status !== 'excluded' && (
    (record.hash && other.hash === record.hash) ||
    (record.cents != null && other.cents === record.cents && record.date && other.date === record.date && normalizedMerchant(record.merchant) && normalizedMerchant(other.merchant) === normalizedMerchant(record.merchant))
  ));
}
export function validateRecord(record, records) {
  const errors = [];
  if (!record.merchant?.trim()) errors.push('merchant');
  if (!validDate(record.date || '')) errors.push('date');
  if (!Number.isSafeInteger(record.cents) || record.cents < 0) errors.push('amount');
  if (!record.category) errors.push('category');
  if (record.suggested?.unsupportedCurrency) errors.push('currency');
  if (duplicateOf(record, records) && !record.allowDuplicate) errors.push('duplicate');
  return errors;
}
export function summary(records) {
  const approved = records.filter(r => r.status === 'approved');
  return {approved:approved.length, pending:records.filter(r => r.status === 'pending').length, excluded:records.filter(r=>r.status === 'excluded').length, cents:approved.reduce((sum,r)=>sum+r.cents,0)};
}
export function csv(records) {
  // Prevent spreadsheet formula execution even when an OCR/user string is malicious.
  const cell = value => {
    let s = String(value ?? '');
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(s)) s = `'${s}`;
    return `"${s.replaceAll('"','""')}"`;
  };
  const rows = [['Estabelecimento','Data','Categoria','Valor BRL','Arquivo','SHA-256','Revisado em','Observacao']];
  for (const r of records.filter(r=>r.status === 'approved')) rows.push([r.merchant,r.date,r.category,formatAmount(r.cents),r.filename,r.hash,r.approvedAt,r.note]);
  return '\uFEFF' + rows.map(row=>row.map(cell).join(';')).join('\r\n');
}
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
