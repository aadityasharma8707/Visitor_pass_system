import { memo } from "react";

/**
 * FilterBar — a row of filter toggle buttons.
 *
 * Eliminates the duplicated filter button rows in Host, Security, and Admin.
 * Accessibility: wraps buttons in a group with aria-label and uses
 * aria-pressed to communicate the active state to screen readers.
 *
 * @param {{
 *   options: Array<{ value: string, label: string }>,
 *   active: string,
 *   onChange: (value: string) => void,
 *   label?: string,  // accessible group label
 * }} props
 */
function FilterBar({ options, active, onChange, label = "Filter options" }) {
  return (
    <div
      className="filter-bar"
      role="group"
      aria-label={label}
    >
      {options.map(({ value, label: optLabel }) => (
        <button
          key={value}
          className={`filter-btn${active === value ? " active" : ""}`}
          onClick={() => onChange(value)}
          aria-pressed={active === value}
        >
          {optLabel}
        </button>
      ))}
    </div>
  );
}

export default memo(FilterBar);
