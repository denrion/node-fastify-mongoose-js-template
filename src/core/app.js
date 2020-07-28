const fastify = require('fastify');

const registerAPIRoutes = require('./registerAPIRoutes');
const registerFastifyPlugins = require('./registerFastifyPlugins');
const registerErrorHandlers = require('./registerErrorHandlers');

// Setup base fastify options
const app = fastify({
  ignoreTrailingSlash: true,
  bodyLimit: +process.env.BODY_PARSER_SIZE_LIMIT,
  logger: {
    prettyPrint: true,
  },
  maxParamLength: 200,
  caseSensitive: true,
  trustProxy: process.env.HOST_NAME === 'Heroku', // Enable https over Heroku: https://www.fastify.io/docs/latest/Server/#trustproxy
});

// Register fastify plugins
registerFastifyPlugins(app);

// Register fastify API routes
registerAPIRoutes(app);

// Register fastify error handlers
registerErrorHandlers(app);

module.exports = app;
