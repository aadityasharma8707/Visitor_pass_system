import { Component } from "react";
import ErrorFallback from "./ErrorFallback";

/**
 * ErrorBoundary — catches rendering errors in its subtree.
 *
 * Must be a class component: React's error boundary API
 * (getDerivedStateFromError / componentDidCatch) is not available as hooks.
 *
 * Strategy:
 * - Wrap each dashboard route individually so a crash in one dashboard
 *   does not kill the navigation or other dashboards.
 * - Also wraps the entire app as a last-resort catch.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Observability hook — swap with real logger in Cycle 5
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
