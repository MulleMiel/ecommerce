const path = require('path');
const express = require('express');
const app = express();

global.appRoot = path.resolve(__dirname);

const loaders = require('./loaders');

const { PORT } = require('./config');

async function startServer() {

  // Init application loaders
  loaders(app);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
  })
}

startServer();