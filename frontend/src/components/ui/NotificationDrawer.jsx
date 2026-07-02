import { memo } from "react";
import { formatTime } from "../../utils/dateUtils";

/**
 * NotificationDrawer — slide-in panel showing notification history.
 *
 * Extracted from the identical notify-drawer rendering in HostDashboard
 * and SecurityDashboard (the Host version had a label; the Security version
 * did not — this component standardizes it).
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   notifications: Array<{ id: number, text: string, type: string, time: Date }>,
 * }} props
 */
function NotificationDrawer({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div
      className="notify-drawer"
      role="dialog"
      aria-label="Notifications panel"
      aria-modal="true"
    >
      <div className="notify-header">
        <b>Notifications</b>
        <button
          onClick={onClose}
          aria-label="Close notifications panel"
        >
          ✕
        </button>
      </div>

      <div className="notify-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notify-item ${n.type || ""}`.trim()}>
              <div>{n.text}</div>
              <small>{formatTime(n.time)}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(NotificationDrawer);
