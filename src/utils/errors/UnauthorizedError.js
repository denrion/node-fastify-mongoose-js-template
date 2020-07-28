const status = require('http-status');
const AppError = require('./AppError');

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, status.UNAUTHORIZED);
  }
}

module.exports = UnauthorizedError;
