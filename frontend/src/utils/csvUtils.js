/**
 * CSV export utility.
 *
 * Extracted from HostDashboard's inline exportCSV() function.
 * Now reusable across any dashboard that needs CSV download.
 *
 * @param {string[]} headers - Column header labels
 * @param {Array<(string|number|null)[]>} rows - Array of row value arrays
 * @param {string} filename - Download filename (e.g. "host_requests.csv")
 */
export function exportToCSV(headers, rows, filename = "export.csv") {
  if (!rows || rows.length === 0) return;

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
