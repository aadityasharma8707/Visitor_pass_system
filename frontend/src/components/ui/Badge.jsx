import { memo } from "react";

/**
 * Badge — status indicator pill.
 *
 * Uses the existing .badge CSS classes from the design system.
 * Accepts a status string and renders the appropriate color variant.
 *
 * @param {{ status: "pending"|"approved"|"rejected", className?: string }} props
 */
function Badge({ status, className = "" }) {
  return (
    <span className={`badge ${status} ${className}`.trim()}>
      {status.toUpperCase()}
    </span>
  );
}

export default memo(Badge);
