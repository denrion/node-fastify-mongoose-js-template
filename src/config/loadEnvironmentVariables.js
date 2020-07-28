const dotenv = require('dotenv');

const loadEnvironmentVariables = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      dotenv.config({ path: './.env.dev' });
      break;
    case 'testing':
      dotenv.config({ path: './.env.test' });
      break;
    default:
      // PRODUCTION
      dotenv.config({ path: './.env' });
      break;
  }
};

module.exports = loadEnvironmentVariables;
