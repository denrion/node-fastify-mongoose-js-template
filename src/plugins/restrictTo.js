const fp = require('fastify-plugin');
const ForbiddenError = require('../utils/errors/ForbiddenError');

const restrictTo = async (fastify, opts, done) => {
  fastify.decorate('restrictTo', async (request, reply, ...roles) => {
    if (!roles.includes(request.user.role))
      throw new ForbiddenError('You do not have permission to perform this action');
  });

  done();
};

module.exports = fp(restrictTo);
