const { getRequestContext } = require("../middleware/requestContext");

class Observability {
  static log(level, message, meta = {}) {
    const { requestId, correlationId } = getRequestContext();
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId,
      correlationId,
      ...meta
    };
    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else if (level === "warn") {
      console.warn(JSON.stringify(payload));
    }
  }

  static info(message, meta) {
    this.log("info", message, meta);
  }

  static warn(message, meta) {
    this.log("warn", message, meta);
  }

  static error(message, meta) {
    this.log("error", message, meta);
  }

  static incrementMetric(name, value = 1, tags = {}) {
    // Future integration hook (e.g. Datadog, Prometheus, StatsD)
  }

  static startSpan(name) {
    // Future integration hook (e.g. OpenTelemetry, Jaeger, AWS X-Ray)
    return {
      finish: () => {}
    };
  }
}

module.exports = Observability;
