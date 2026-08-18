const cron = require("node-cron");
const env = require("../config/env");
const logger = require("../utils/logger");
const syncService = require("../services/syncService");

function iniciarCronDeSincronizacao() {
  const minutos = env.sync.cronIntervalMinutes;
  const expressao = `*/${minutos} * * * *`;

  cron.schedule(expressao, () => {
    syncService.executarSincronizacao({ manual: false }).catch((err) => {
      logger.error(`Sincronização agendada falhou: ${err.message}`);
    });
  });

  logger.info(`Cron de sincronização agendado: a cada ${minutos} minuto(s) ("${expressao}").`);
}

module.exports = { iniciarCronDeSincronizacao };
