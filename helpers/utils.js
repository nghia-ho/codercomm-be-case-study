const utilHelper = {};

utilHelper.sendResponse = (res, status, success, data, errors, message) => {
  const response = {};

  if (success) response.success = success;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  if (message) response.message = message;

  return res.status(status).json(response);
};

utilHelper.catchAsync = (func) => (req, res, next) =>
  func(req, res, next).catch((error) => next(error));

class AppError extends Error {
  constructor(statusCode, message, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errorType = errorType;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
utilHelper.AppError = AppError;

module.exports = utilHelper;
