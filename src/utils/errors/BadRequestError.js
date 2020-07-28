const status = require('http-status');
const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message) {
    super(message, status.BAD_REQUEST);
  }
}

module.exports = BadRequestError;
