import { useState, useCallback, useRef } from "react";

/**
 * useApiRequest — centralized API loading / error / cancellation hook.
 *
 * Decision: Abstracts the repetitive (loading, error, data) state trio
 * that was independently declared in every dashboard. Also prepares an
 * AbortController extension point so requests can be cancelled on unmount.
 *
 * Usage:
 *   const { loading, error, execute } = useApiRequest();
 *   const data = await execute(() => api.get('/visitor/hosts'));
 */
export function useApiRequest() {
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const abortRef                = useRef(null);

  /**
   * Execute an async API call with automatic loading + error state management.
   *
   * @param {() => Promise<any>} fn - Function that returns a Promise (api.get/post/etc.)
   * @param {{ silent?: boolean }} options
   *   silent — if true, errors are swallowed and returned as null (for background polling)
   * @returns {Promise<any|null>} - Resolved data, or null on error
   */
  const execute = useCallback(async (fn, { silent = false } = {}) => {
    // Cancel any in-flight request from a previous execute() call
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      if (err.name === "AbortError") return null; // Cancelled — not an error
      if (!silent) setError(err.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Cancel the current in-flight request programmatically. */
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return { loading, error, execute, cancel };
}

export default useApiRequest;
