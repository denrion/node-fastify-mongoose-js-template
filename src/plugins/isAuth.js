const fp = require('fastify-plugin');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');
const User = require('../models/User/user.model');

const isAuth = async (fastify, opts, done) => {
  fastify.decorate('isAuth', async (request, reply) => {
    let payload = {};

    try {
      payload = await request.jwtVerify();
    } catch (err) {
      throw new UnauthorizedError('Not authenticated. Please log in to get access');
    }

    const currentUser = await User.findById(payload.id);

    if (!currentUser || !currentUser.isActive)
      throw new UnauthorizedError('The user, to whom this token belongs, no longer exists.');

    if (currentUser.isPasswordChangedAfter(payload.iat))
      throw new UnauthorizedError('The password was recently changed! Please log in again.');

    request.user = currentUser;
  });

  done();
};

module.exports = fp(isAuth);
