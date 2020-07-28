const status = require('http-status');
const AppError = require('./AppError');

class NotImplementedError extends AppError {
  constructor(message) {
    super(message, status.NOT_IMPLEMENTED);
  }
}

module.exports = NotImplementedError;
