/**
 * DashboardLayout — shared structural wrapper for all authenticated dashboards.
 *
 * Provides:
 *   - Consistent page container
 *   - Tab navigation bar
 *   - Logout button in header (right-aligned)
 *   - Notification bell button
 *
 * Decision: The header+tab bar pattern was independently rendered in
 * HostDashboard and SecurityDashboard. AdminDashboard uses a different
 * sidebar layout and is NOT wrapped by this component.
 *
 * @param {{
 *   title: string,
 *   token: string,
 *   onLogout: () => void,
 *   tabs?: Array<{ value: string, label: string }>,
 *   activeTab?: string,
 *   onTabChange?: (tab: string) => void,
 *   onNotificationsClick?: () => void,
 *   children: React.ReactNode,
 * }} props
 */
export default function DashboardLayout({
  title,
  token,
  onLogout,
  tabs = [],
  activeTab,
  onTabChange,
  onNotificationsClick,
  children,
}) {
  return (
    <div className="page">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {token && (
          <button
            type="button"
            onClick={onLogout}
            style={{ marginLeft: "auto" }}
            aria-label={`Logout from ${title}`}
          >
            Logout
          </button>
        )}
      </div>

      {/* Tab Bar (only rendered when tabs are provided and user is logged in) */}
      {token && tabs.length > 0 && (
        <nav
          aria-label={`${title} sections`}
          style={{ display: "flex", gap: 10, marginBottom: 14 }}
        >
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`filter-btn${activeTab === value ? " active" : ""}`}
              onClick={() => onTabChange?.(value)}
              aria-current={activeTab === value ? "page" : undefined}
            >
              {label}
            </button>
          ))}

          {onNotificationsClick && (
            <button
              type="button"
              style={{ marginLeft: "auto" }}
              onClick={onNotificationsClick}
              aria-label="Open notifications panel"
            >
              🔔 Notifications
            </button>
          )}
        </nav>
      )}

      {children}
    </div>
  );
}
