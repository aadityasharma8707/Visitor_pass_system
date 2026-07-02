/**
 * ErrorFallback — user-facing recovery screen rendered by ErrorBoundary.
 *
 * Shows a sanitized error message (no stack traces exposed to users).
 * Provides two recovery paths:
 *   1. Reset — tries to re-render the failed subtree (for transient errors)
 *   2. Go Home — full navigation reset to the root route
 */
export default function ErrorFallback({ error, onReset }) {
  return (
    <div
      role="alert"
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: 32,
        borderRadius: 18,
        background: "color-mix(in srgb, var(--card) 85%, transparent)",
        backdropFilter: "blur(18px)",
        border: "1px solid var(--border)",
        boxShadow: "0 25px 50px rgba(239,68,68,.1)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h3 style={{ color: "var(--danger)", marginBottom: 8 }}>
        Something went wrong
      </h3>
      <p style={{ opacity: 0.75, marginBottom: 24, fontSize: 14 }}>
        {error?.message
          ? `Error: ${error.message}`
          : "An unexpected rendering error occurred."}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          type="button"
          onClick={onReset}
          aria-label="Try to reload the failed section"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            boxShadow: "none",
          }}
          aria-label="Go back to the home page"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
