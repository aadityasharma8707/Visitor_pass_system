const { DomainError } = require("../errors");

const errorMiddleware = (err, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";

  // Check if it is a known domain exception
  if (err instanceof DomainError || err.status) {
    status = err.status || 400;
    message = err.message;
    console.warn(`[Client Error - ${status}]: ${message}`);
  } else {
    // Unhandled application crash (log complete stack trace for debuggers)
    console.error(`[Unhandled Server Error]:`, err);
  }

  res.status(status).json({
    message
  });
};

module.exports = errorMiddleware;
