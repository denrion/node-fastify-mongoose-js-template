const fastify = require('fastify');

const registerAPIRoutes = require('./registerAPIRoutes');
const registerFastifyPlugins = require('./registerFastifyPlugins');
const registerErrorHandlers = require('./registerErrorHandlers');

// Setup base fastify options
const app = fastify({
  ignoreTrailingSlash: true,
  caseSensitive: true,
  bodyLimit: +process.env.FASTIFY_BODY_SIZE_LIMIT ?? 10240,
  maxParamLength: +process.env.FASTIFY_MAX_PARAM_LENGTH ?? 200,
  trustProxy: process.env.HOST_NAME === 'Heroku', // Enable https over Heroku: https://www.fastify.io/docs/latest/Server/#trustproxy,
  logger: {
    prettyPrint: true,
  },
});

// Register fastify plugins
registerFastifyPlugins(app);

// Register fastify API routes
registerAPIRoutes(app);

// Register fastify error handlers
registerErrorHandlers(app);

module.exports = app;
