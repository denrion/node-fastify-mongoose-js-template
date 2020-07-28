module.exports = {
  apps: [
    {
      name: 'app',
      script: './src/server.js',
      instances: 'max',
      env: {
        NODE_ENV: 'development',
      },
      // eslint-disable-next-line babel/camelcase
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
