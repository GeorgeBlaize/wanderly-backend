const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

// Centralized error handler: normalizes Prisma/JWT/Zod errors into a consistent shape.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  if (err.code === "P2002") {
    statusCode = 409;
    message = `Duplicate value for field: ${err.meta?.target?.join(", ") || "unique field"}`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  } else if (err.code === "P2003") {
    statusCode = 409;
    message = "This record is still referenced by other data and cannot be deleted";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired session, please log in again";
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { notFound, errorHandler };
