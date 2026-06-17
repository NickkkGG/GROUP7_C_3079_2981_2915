// Bangun & download file CSV di sisi client (single source of truth).
// Setiap nilai di-escape dengan membungkus tanda kutip ganda dan menggandakan
// kutip internal, lalu ditambah BOM agar Excel membaca UTF-8 dengan benar.
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
