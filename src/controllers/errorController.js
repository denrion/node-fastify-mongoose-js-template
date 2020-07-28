/* eslint-disable no-console */
const status = require('http-status');
const BadRequestError = require('../utils/errors/BadRequestError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');
const ResponseStatus = require('../constants/ResponseStatus');

const globalErrorHandler = (error, request, reply) => {
  error.statusCode = error.statusCode ?? status.INTERNAL_SERVER_ERROR;
  error.status = error.status ?? ResponseStatus.ERROR;

  let err = { ...error, message: error.message, stack: error.stack };

  if (process.env.NODE_ENV === 'development') {
    sendErrorResponse(err, reply);
  } else if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') err = handleCastErrorDB(error);
    else if (error.code === 11000) err = handleDuplicateFieldsDB(error);
    else if (error.name === 'ValidationError') err = handleValidationErrorDB(error);
    else if (error.message.includes('jwt malformed')) err = handleJWTError();
    else if (error.message.includes('token expired')) err = handleJWTExpiredError();

    sendErrorResponse(err, reply);
  }
};

// Format & send error response
const sendErrorResponse = (error, reply) => {
  return reply.status(error.statusCode).send({
    status: error.status,
    statusCode: error.statusCode,
    // Operational, trusted error: send message to client
    // Programming or other unknown error: don`t leak the error detals
    message:
      process.env.NODE_ENV === 'production' && !error.isOperational
        ? 'Something went very wrong'
        : error.message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
  // .log.error(error);
};

// Handle specific error functions
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new BadRequestError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new BadRequestError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new BadRequestError(message);
};

const handleJWTError = () => new UnauthorizedError('Invalid token. Please log in again.');

const handleJWTExpiredError = () => new UnauthorizedError('Token expired. Please log in again.');

module.exports = globalErrorHandler;
