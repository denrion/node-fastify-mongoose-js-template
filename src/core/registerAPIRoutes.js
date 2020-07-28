const authRouter = require('../routes/v1/authRoutes');
const userRouter = require('../routes/v1/userRoutes');

const registerV1Routes = (fastify, opts, done) => {
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.register(userRouter, { prefix: '/users' });

  done();
};

const registerAPIRoutes = (fastify) => {
  fastify.register(registerV1Routes, { prefix: '/api/v1' });
};

module.exports = registerAPIRoutes;
