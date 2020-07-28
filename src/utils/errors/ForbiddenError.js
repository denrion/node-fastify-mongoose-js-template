const status = require('http-status');
const AppError = require('./AppError');

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, status.FORBIDDEN);
  }
}

module.exports = ForbiddenError;
