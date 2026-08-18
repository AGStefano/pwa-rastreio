const env = require("./config/env");
const logger = require("./utils/logger");
const criarApp = require("./app");
const { iniciarCronDeSincronizacao } = require("./jobs/syncCron");

const app = criarApp();

app.listen(env.port, () => {
  logger.info(`Servidor rodando em http://localhost:${env.port}`);
  // iniciarCronDeSincronizacao();
});
