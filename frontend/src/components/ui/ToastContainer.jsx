import { memo } from "react";

/**
 * ToastContainer — renders the active toast notification stack.
 *
 * Extracted from the identical toast rendering in HostDashboard and SecurityDashboard.
 * Added aria-live="polite" so screen readers announce new toasts.
 *
 * @param {{ toasts: Array<{ id: number, text: string, type: string }> }} props
 */
function ToastContainer({ toasts }) {
  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-atomic="false"
      role="status"
    >
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || ""}`.trim()}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export default memo(ToastContainer);
