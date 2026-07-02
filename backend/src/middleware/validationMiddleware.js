const { ValidationError } = require("../errors");

const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        const validationErr = new ValidationError(formattedErrors.join(", "));
        validationErr.errors = formattedErrors;
        return next(validationErr);
      }
      next(error);
    }
  };
};

module.exports = validate;
