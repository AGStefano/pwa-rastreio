const axios = require("axios");
const env = require("../config/env");
const { AppError } = require("../utils/errors");

const http = axios.create({
  baseURL: env.olist.trackingBaseUrl,
  timeout: env.olist.timeoutMs,
});

// Chamado ao vivo, sob demanda — nunca persistido no banco.
async function obterRastreio(codigoRastreamento) {
  let response;
  try {
    response = await http.get(`${encodeURIComponent(codigoRastreamento)}/trackings`);
  } catch (err) {
    throw new AppError(
      "Não foi possível obter o rastreio no momento. Tente novamente em instantes.",
      502,
      "ERRO_OLIST_ENVIOS"
    );
  }

  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
}

module.exports = { obterRastreio };
