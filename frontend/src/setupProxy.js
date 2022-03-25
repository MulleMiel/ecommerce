const { createProxyMiddleware } = require('http-proxy-middleware');
const { PORT } = require('../../config');

module.exports = function(app) {
  app.use(
    '/auth/**',
    createProxyMiddleware({
      target: `http://localhost:${PORT}`,
      changeOrigin: true,
    })
  );
};