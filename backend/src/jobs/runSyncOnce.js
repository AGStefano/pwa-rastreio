// Executa uma sincronização única via linha de comando (npm run sync), útil para testes.
const syncService = require("../services/syncService");
const logger = require("../utils/logger");

syncService
  .executarSincronizacao({ manual: true })
  .then((resultado) => {
    logger.info(`Resultado: ${JSON.stringify(resultado)}`);
    process.exit(0);
  })
  .catch((err) => {
    logger.error(`Sincronização manual falhou: ${err.stack || err.message}`);
    process.exit(1);
  });
