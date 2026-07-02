import { memo } from "react";

/**
 * EmptyState — consistent "no results" placeholder.
 *
 * Replaces 6+ inline empty-state fragments spread across all pages.
 *
 * @param {{ icon?: string, message: string }} props
 */
function EmptyState({ icon = "📭", message }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      {icon && <span aria-hidden="true">{icon} </span>}
      {message}
    </div>
  );
}

export default memo(EmptyState);
