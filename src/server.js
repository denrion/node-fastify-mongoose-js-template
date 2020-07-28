const makePromisesSafe = require('make-promises-safe');

require('./config/loadEnvironmentVariables.js')();
require('./config/connectMongoDB.js')();
const app = require('./core/app');

const PORT = process.env.PORT ?? 4000;
const HOST = process.env.HOST ?? '127.0.0.1';

const startServer = async () => {
  try {
    const address = await app.listen(PORT, HOST);
    app.log.info(`Server is listening in ${process.env.NODE_ENV} mode, on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
makePromisesSafe.logError = async (err) => {
  // Log error
  app.log.error(err);

  // Close server
  await app.close();

  // Exit process
  process.exit(1);
};

startServer();
