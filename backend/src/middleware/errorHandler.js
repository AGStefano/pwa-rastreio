const logger = require("../utils/logger");
const { AppError } = require("../utils/errors");

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  return res.status(500).json({
    error: { code: "ERRO_INTERNO", message: "Ocorreu um erro inesperado." },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: "ROTA_NAO_ENCONTRADA", message: `Rota ${req.method} ${req.originalUrl} não existe.` },
  });
}

module.exports = { errorHandler, notFoundHandler };
