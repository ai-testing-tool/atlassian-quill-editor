import Quill from 'quill';
import type { TableCellValue, TableEmbedValue } from '../../types';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

function renderTable(value: TableEmbedValue): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'aqe-table';
  const tbody = document.createElement('tbody');

  for (const row of value.rows) {
    const tr = document.createElement('tr');
    for (const cell of row) {
      const td = document.createElement(cell.header ? 'th' : 'td');
      td.setAttribute('contenteditable', 'true');
      if (cell.background) td.style.background = cell.background;
      if (cell.colspan && cell.colspan > 1) td.colSpan = cell.colspan;
      if (cell.rowspan && cell.rowspan > 1) td.rowSpan = cell.rowspan;
      if (cell.header) td.setAttribute('data-header', 'true');
      td.textContent = cell.text;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  return table;
}

function readTable(node: HTMLElement): TableEmbedValue {
  const table = node.querySelector('table');
  const rows: TableCellValue[][] = [];
  if (!table) return { rows: [[{ text: '' }, { text: '' }]] };

  table.querySelectorAll('tr').forEach((tr) => {
    const cells: TableCellValue[] = [];
    tr.querySelectorAll('th,td').forEach((cell) => {
      const el = cell as HTMLTableCellElement;
      cells.push({
        header: el.tagName === 'TH' || el.getAttribute('data-header') === 'true',
        text: el.textContent ?? '',
        background: el.style.background || undefined,
        colspan: el.colSpan > 1 ? el.colSpan : undefined,
        rowspan: el.rowSpan > 1 ? el.rowSpan : undefined,
      });
    });
    rows.push(cells);
  });

  return {
    rows,
    layout: (node.getAttribute('data-layout') as TableEmbedValue['layout']) || undefined,
  };
}

export class TableBlot extends BlockEmbed {
  static blotName = 'adfTable';
  static tagName = 'DIV';
  static className = 'aqe-table-wrap';

  static create(value: TableEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    if (value.layout) node.setAttribute('data-layout', value.layout);
    node.setAttribute('contenteditable', 'false');
    node.replaceChildren(renderTable(value));
    return node;
  }

  static value(node: HTMLElement): TableEmbedValue {
    return readTable(node);
  }
}
