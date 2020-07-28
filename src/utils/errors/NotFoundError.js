const status = require('http-status');
const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(message) {
    super(message, status.NOT_FOUND);
  }
}

module.exports = NotFoundError;
