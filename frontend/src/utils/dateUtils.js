/**
 * Date formatting utilities.
 *
 * Centralizes the 8+ inline ternary date expressions spread across pages:
 *   r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "-"
 *
 * All functions handle null/undefined gracefully by returning "-".
 */

/**
 * Format a date value as a locale date string (e.g. "7/2/2026").
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

/**
 * Format a date value as a locale date+time string (e.g. "7/2/2026, 5:30 PM").
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

/**
 * Format a date value as a locale time string (e.g. "5:30 PM").
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleTimeString();
}
