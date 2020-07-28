const status = require('http-status');
const AppError = require('./AppError');

class InternalServerError extends AppError {
  constructor(message) {
    super(message, status.INTERNAL_SERVER_ERROR);
  }
}

module.exports = InternalServerError;
