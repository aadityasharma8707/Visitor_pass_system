import React from "react";

/**
 * Button — small wrapper to ensure consistent behavior and accessibility.
 * - defaults to `type="button"` to avoid accidental form submits
 * - supports `variant` for styling hooks
 */
export default function Button({
  type = "button",
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
