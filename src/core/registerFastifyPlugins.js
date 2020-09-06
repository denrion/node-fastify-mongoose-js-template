const fastifyJwt = require('fastify-jwt');
const fastifyCompress = require('fastify-compress');
const fastifyCookie = require('fastify-cookie');
const fastifyCORS = require('fastify-cors');
const fastifyHelmet = require('fastify-helmet');
const fastifyRateLimit = require('fastify-rate-limit');
const fastifyMetrics = require('fastify-metrics');

const isAuth = require('../plugins/isAuth');
const restrictTo = require('../plugins/restrictTo');

const registerFastifyPlugins = async (fastify) => {
  // https://github.com/fastify/fastify-helmet
  fastify.register(fastifyHelmet);

  fastify.register(fastifyRateLimit, {
    max: +process.env.FASTIFY_RATE_LIMIT_MAX_NUM_CONNECTIONS ?? 1000,
    timeWindow: +process.env.FASTIFY_RATE_LIMIT_TIME_WINDOW_MS ?? 60000,
  });

  // https://github.com/fastify/fastify-jwt
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: process.env.JWT_COOKIE_NAME,
    },
  });

  // https://github.com/fastify/fastify-cookie
  fastify.register(fastifyCookie);

  // https://github.com/fastify/fastify-cors
  fastify.register(fastifyCORS, { origin: '*', credentials: true });

  // https://github.com/fastify/fastify-compress
  fastify.register(fastifyCompress);

  // https://gitlab.com/m03geek/fastify-metrics
  fastify.register(fastifyMetrics, { endpoint: '/metrics' });

  // Custom plugins
  fastify.register(isAuth);
  fastify.register(restrictTo);
};

module.exports = registerFastifyPlugins;
