import { useState, useMemo } from "react";

/**
 * useFilterSort — reusable filter + sort + search state hook.
 *
 * Decision: The filter/sort/search computation was duplicated in both
 * HostDashboard (~30 lines) and AdminDashboard (~15 lines) with nearly
 * identical logic. Extracting it makes both pages simpler and ensures
 * consistent behavior.
 *
 * @param {any[]} items - The source array to filter and sort
 * @param {Object} options
 * @param {string[]} options.searchFields - Dot-notation paths to search in (e.g. ["visitor.name", "purpose"])
 * @param {string} [options.statusField] - Field name for status filtering (default: "status")
 * @param {string} [options.defaultSort] - Default sort key (default: "newest")
 *
 * @returns {{
 *   filtered: any[],
 *   search: string,
 *   setSearch: Function,
 *   filter: string,
 *   setFilter: Function,
 *   sortBy: string,
 *   setSortBy: Function,
 * }}
 */
export function useFilterSort(items = [], {
  searchFields = [],
  statusField = "status",
  defaultSort = "newest",
} = {}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState(defaultSort);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return [...items]
      .filter((item) => {
        // Status filter
        const matchStatus =
          filter === "all" || getNestedValue(item, statusField) === filter;

        // Search filter — searches across all specified fields
        const matchSearch =
          !lowerSearch ||
          searchFields.some((fieldPath) => {
            const val = getNestedValue(item, fieldPath) ?? "";
            return String(val).toLowerCase().includes(lowerSearch);
          });

        return matchStatus && matchSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (getNestedValue(a, searchFields[0]) ?? "")
              .localeCompare(getNestedValue(b, searchFields[0]) ?? "");
          case "status":
            return (getNestedValue(a, statusField) ?? "")
              .localeCompare(getNestedValue(b, statusField) ?? "");
          case "visitDate":
            return new Date(a.visitDate || 0) - new Date(b.visitDate || 0);
          case "oldest":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "newest":
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  }, [items, search, filter, sortBy, searchFields, statusField]);

  return { filtered, search, setSearch, filter, setFilter, sortBy, setSortBy };
}

/**
 * Reads a dot-notation path from a nested object.
 * e.g. getNestedValue(obj, "visitor.name") === obj?.visitor?.name
 */
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export default useFilterSort;
