const { getRequestContext } = require("./requestContext");

const standardResponseMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (body && typeof body === "object" && ("success" in body) && ("timestamp" in body)) {
      return originalJson.call(this, body);
    }

    const { requestId } = getRequestContext();
    const isError = res.statusCode >= 400;

    let message = "Success";
    if (body && typeof body === "object" && body.message) {
      message = body.message;
    } else if (isError) {
      message = "Error occurred";
    }

    let responseData = body;
    let errors = null;

    if (isError) {
      responseData = null;
      errors = body?.errors || [body?.message || "Internal Server Error"];
    } else {
      if (body && typeof body === "object" && body.data !== undefined) {
        responseData = body.data;
      }
    }

    const formatted = {
      success: !isError,
      message,
      data: responseData,
      errors,
      timestamp: new Date().toISOString(),
      requestId: requestId || req.requestId || null,
      ...(body && typeof body === "object" ? body : {})
    };

    return originalJson.call(this, formatted);
  };

  next();
};

module.exports = standardResponseMiddleware;
