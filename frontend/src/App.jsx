import { lazy, Suspense } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ErrorBoundary from "./errors/ErrorBoundary";
import RouteConstants from "./constants/routes";
import SkeletonLoader from "./components/ui/SkeletonLoader";

/**
 * Lazy-load the three authenticated dashboards.
 *
 * Decision: VisitorRequest is the public landing page and loads eagerly
 * to prevent any delay on first visit. The three role-specific dashboards
 * are lazy-loaded — they are only visited after navigation, so the Suspense
 * fallback is acceptable. This reduces the initial JS bundle by ~60-70%.
 */
import VisitorRequest from "./pages/VisitorRequest";
const HostDashboard     = lazy(() => import("./pages/HostDashboard"));
const SecurityDashboard = lazy(() => import("./pages/SecurityDashboard"));
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard"));

/** Page-level skeleton shown while a lazy dashboard chunk is loading. */
function PageSkeleton() {
  return (
    <div className="page">
      <SkeletonLoader count={6} />
    </div>
  );
}

/** Inner app that can access ThemeContext. */
function AppInner() {
  const { dark, toggle } = useTheme();

  return (
    <div className="app">
      <h2>Visitor Pass System</h2>

      <nav aria-label="Main navigation">
        <div>
          <NavLink to={RouteConstants.VISITOR}>Visitor</NavLink>
          <NavLink to={RouteConstants.HOST}>Host</NavLink>
          <NavLink to={RouteConstants.SECURITY}>Security</NavLink>
          <NavLink to={RouteConstants.ADMIN}>Admin</NavLink>
        </div>

        {/* Theme toggle — now a proper button with aria-label and aria-pressed */}
        <button
          className="theme-switch"
          onClick={toggle}
          aria-label="Toggle dark mode"
          aria-pressed={dark}
          style={{ padding: 0, background: "none", boxShadow: "none", border: "none" }}
        >
          <div
            className="theme-switch"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            <div className="theme-knob" />
          </div>
        </button>
      </nav>

      {/* Each route is wrapped in its own ErrorBoundary so a crash in one
          dashboard does not take down the navigation or other dashboards. */}
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route
            path={RouteConstants.VISITOR}
            element={
              <ErrorBoundary>
                <VisitorRequest />
              </ErrorBoundary>
            }
          />
          <Route
            path={RouteConstants.HOST}
            element={
              <ErrorBoundary>
                <HostDashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path={RouteConstants.SECURITY}
            element={
              <ErrorBoundary>
                <SecurityDashboard />
              </ErrorBoundary>
            }
          />
          <Route
            path={RouteConstants.ADMIN}
            element={
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}