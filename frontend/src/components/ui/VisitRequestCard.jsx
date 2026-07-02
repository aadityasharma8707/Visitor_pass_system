import { memo } from "react";
import Badge from "./Badge";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

/**
 * VisitRequestCard — reusable card for a single visit request.
 *
 * Used in: HostDashboard (requests tab), AdminDashboard (requests tab).
 * Accepts different action configurations per context via props.
 *
 * Accessibility:
 * - Card is made keyboard-focusable if it is expandable (tabIndex=0, role=button)
 * - Action buttons stop event propagation to prevent card expand/collapse conflicts
 *
 * @param {{
 *   request: object,
 *   expandedId?: string,
 *   onExpand?: (id: string) => void,
 *   actions?: React.ReactNode,    // Approve, Reject, or other action buttons
 *   loadingId?: string,
 * }} props
 */
function VisitRequestCard({ request: r, expandedId, onExpand, actions, loadingId }) {
  const isExpanded = expandedId === r._id;
  const isExpandable = typeof onExpand === "function";

  const handleKeyDown = (e) => {
    if (isExpandable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onExpand(r._id);
    }
  };

  return (
    <div
      className={`card${isExpanded ? " expanded" : ""}`}
      onClick={isExpandable ? () => onExpand(r._id) : undefined}
      onKeyDown={handleKeyDown}
      role={isExpandable ? "button" : undefined}
      tabIndex={isExpandable ? 0 : undefined}
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-label={isExpandable ? `Visit request from ${r.visitor?.name || "visitor"}` : undefined}
    >
      <p><b>Visitor:</b> {r.visitor?.name || "—"}</p>
      <p><b>Purpose:</b> {r.purpose}</p>
      {r.host && <p><b>Host:</b> {r.host?.name || "—"}</p>}

      <p>
        <b>Status:</b>{" "}
        <Badge status={r.status} />
      </p>

      {/* Action slot — caller provides context-specific buttons */}
      {actions && (
        <div onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}

      {/* Expandable details */}
      <div className="extra">
        <p><b>Request ID:</b> {r._id}</p>
        <p><b>Visit date:</b> {formatDate(r.visitDate)}</p>
        <p><b>Created:</b> {formatDateTime(r.createdAt)}</p>
        {r.passCode && <p><b>Pass code:</b> {r.passCode}</p>}
      </div>
    </div>
  );
}

export default memo(VisitRequestCard);
