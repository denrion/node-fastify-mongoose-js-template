const ResponseStatus = require('../../constants/ResponseStatus');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')
      ? ResponseStatus.FAILURE
      : ResponseStatus.ERROR;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
