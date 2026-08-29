export function notFound(req, res, next) {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// Central error handler. Never leaks stack traces or raw Mongo/JWT errors
// to the client — those are logged server-side and translated into a
// friendly, consistent shape.
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong. Please try again.";

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found.";
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already in use.`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Session is invalid. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please log in again.";
  }

  if (statusCode === 500) {
    console.error(err);
    message = "Something went wrong on our end. Please try again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
