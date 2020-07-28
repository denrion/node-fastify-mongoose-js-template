const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require('../../controllers/userController');
const Role = require('../../constants/Role');

const userRouter = (fastify, opts, done) => {
  fastify.addHook('preValidation', async (request, reply) => {
    await fastify.isAuth(request, reply);
    await fastify.restrictTo(request, reply, Role.ADMIN);
  });

  fastify.get('/', getAllUsers);
  fastify.post('/', createUser);
  fastify.get('/:id', getUserById);
  fastify.patch('/:id', updateUser);
  fastify.delete('/:id', deleteUser);

  done();
};

module.exports = userRouter;
