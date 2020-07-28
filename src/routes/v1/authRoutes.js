const {
  signup,
  login,
  getMe,
  updateMe,
  updateMyPassword,
  deleteMe,
} = require('../../controllers/authController');

const authRouter = (fastify, opts, done) => {
  fastify.post('/signup', signup);
  fastify.post('/login', login);

  // Create new scope for routes that need to go through isAuth check
  fastify.register((fastify, opts, done) => {
    fastify.addHook('preValidation', async (request, reply) => {
      await fastify.isAuth(request, reply);
    });

    fastify.get('/me', getMe);
    fastify.patch('/updateMe', updateMe);
    fastify.patch('/updateMyPassword', updateMyPassword);
    fastify.delete('/deleteMe', deleteMe);

    done();
  });

  done();
};

module.exports = authRouter;
