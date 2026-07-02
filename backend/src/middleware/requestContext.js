const { AsyncLocalStorage } = require("async_hooks");
const { v4: uuidv4 } = require("uuid");

const contextStorage = new AsyncLocalStorage();

const requestContextMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

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
