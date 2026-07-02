const { AsyncLocalStorage } = require("async_hooks");
const crypto = require('crypto');

const contextStorage = new AsyncLocalStorage();

function generateUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  try {
    // best-effort fallback if running on older node where crypto.randomUUID
    // isn't available. This may require the `uuid` package which can be ESM.
    // Only attempt it as a fallback.
    // eslint-disable-next-line global-require
    const { v4 } = require('uuid');
    return v4();
  } catch (e) {
    // Final fallback: use random bytes hex
    return crypto.randomBytes(16).toString('hex');
  }
}

const requestContextMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || generateUuid();
  const correlationId = req.headers["x-correlation-id"] || generateUuid();

  // Set properties on request object
  req.requestId = requestId;
  req.correlationId = correlationId;

  // Set properties on response header
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Correlation-ID", correlationId);

  const store = {
    requestId,
    correlationId
  };

  contextStorage.run(store, () => {
    next();
  });
};

function getRequestContext() {
  return contextStorage.getStore() || {};
}

module.exports = {
  requestContextMiddleware,
  getRequestContext
};
