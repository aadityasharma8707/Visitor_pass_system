import { memo } from "react";

/**
 * SearchInput — accessible text search field.
 *
 * Wraps a standard <input> with proper id, htmlFor, and aria-label
 * to satisfy WCAG 2.1 Label criterion (1.3.1, 3.3.2).
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   onChange: (e: Event) => void,
 *   placeholder?: string,
 *   style?: object,
 * }} props
 */
function SearchInput({ id, label, value, onChange, placeholder, style }) {
  return (
    <div style={style}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        role="searchbox"
        aria-label={label}
        placeholder={placeholder || label}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default memo(SearchInput);
