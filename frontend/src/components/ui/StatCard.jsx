import { memo } from "react";

/**
 * StatCard — numeric summary card.
 *
 * Reuses existing .stat-card / .stat-title / .stat-value CSS classes.
 * Eliminates the 16+ lines of duplicated stat card JSX in Host and Admin dashboards.
 *
 * @param {{ title: string, value: number|string }} props
 */
function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default memo(StatCard);
