import { memo } from "react";

/**
 * SkeletonLoader — loading placeholder grid to prevent layout shift.
 *
 * Reuses the existing .skeleton and .cards CSS classes.
 * Extracted from the inline skeleton rendering in HostDashboard.
 *
 * @param {{ count?: number }} props
 */
function SkeletonLoader({ count = 4 }) {
  return (
    <div className="cards" aria-busy="true" aria-label="Loading...">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" aria-hidden="true" />
      ))}
    </div>
  );
}

export default memo(SkeletonLoader);
