const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

function criarApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use("/api", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = criarApp;
