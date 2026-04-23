import { format } from 'date-fns-tz';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TIME_ZONE = 'America/Sao_Paulo';

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'dd/MM/yyyy HH:mm:ss', { timeZone: TIME_ZONE });
}

export function buildExportRows(rows) {
  return rows.map(row => ({
    ID: row.id ?? '',
    Nome: row.nome ?? '',
    Telefone: row.fone ?? '',
    'Nome do convidado': row.nomeConvidado ?? '',
    'Telefone do convidado': row.foneConvidado ?? '',
    Loja: row.loja ?? '',
    Praça: row.praca ?? '',
    'Data cadastro': formatDateTime(row.dataCadastro)
  }));
}

export function downloadXlsx(rows, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(buildExportRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastros');
  XLSX.writeFile(workbook, fileName);
}

export function downloadPdf(rows, fileName, metadata = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.text('Consulta de Cadastros de Promoção', 40, 40);

  doc.setFontSize(10);
  const metaLines = [
    metadata.praca ? `Praça: ${metadata.praca}` : null,
    metadata.nome ? `Nome: ${metadata.nome}` : null,
    metadata.loja ? `Loja: ${metadata.loja}` : null,
    metadata.periodo ? `Período: ${metadata.periodo}` : null
  ].filter(Boolean);

  if (metaLines.length > 0) {
    doc.text(metaLines.join(' | '), 40, 60);
  }

  autoTable(doc, {
    startY: metaLines.length > 0 ? 78 : 60,
    head: [[
      'ID',
      'Nome',
      'Telefone',
      'Nome do convidado',
      'Telefone do convidado',
      'Loja',
      'Praça',
      'Data cadastro'
    ]],
    body: rows.map(row => [
      row.id ?? '',
      row.nome ?? '',
      row.fone ?? '',
      row.nomeConvidado ?? '',
      row.foneConvidado ?? '',
      row.loja ?? '',
      row.praca ?? '',
      formatDateTime(row.dataCadastro)
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 4,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [191, 0, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(fileName);
}
