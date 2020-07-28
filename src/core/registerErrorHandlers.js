const globalErrorHander = require('../controllers/errorController');
const NotImplementedError = require('../utils/errors/NotImplementedError');

const registerFastifyPlugins = (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    throw new NotImplementedError(`Cannot find ${request.url} on this server!`);
  });

  fastify.setErrorHandler(globalErrorHander);
};

module.exports = registerFastifyPlugins;
