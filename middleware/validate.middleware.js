const ApiError = require("../utils/ApiError");

// Validates req.body (or req.query) against a zod schema; on failure returns 400 with field errors.
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(new ApiError(400, "Validation failed", errors));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
