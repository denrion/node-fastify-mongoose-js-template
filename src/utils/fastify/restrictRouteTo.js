const restrictRouteTo = (fastify, ...allowedRoles) => {
  return {
    async onRequest(request, reply) {
      await fastify.restrictTo(request, reply, ...allowedRoles);
    },
  };
};

module.exports = restrictRouteTo;
