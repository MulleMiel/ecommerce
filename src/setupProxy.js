const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function(app) {
  app.use(
    '/auth/**',
    createProxyMiddleware({
      target: `http://localhost:${process.env.BACKEND_PORT}`,
      changeOrigin: true,
    })
  );
};