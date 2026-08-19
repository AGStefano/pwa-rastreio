const axios = require("axios");
const env = require("../config/env");
const { AppError } = require("../utils/errors");

const httpVolumes = axios.create({
  baseURL: env.olist.trackingBaseUrl,
  timeout: env.olist.timeoutMs,
});

const httpShipments = axios.create({
  baseURL: env.olist.shipmentsBaseUrl,
  timeout: env.olist.timeoutMs,
});

// Chamado ao vivo, sob demanda — nunca persistido no banco.
// Rastreio de um pacote (volume) específico.
async function obterRastreioVolume(codigoRastreamento) {
  let response;
  try {
    response = await httpVolumes.get(`${encodeURIComponent(codigoRastreamento)}/trackings`);
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

// Rastreio de um pedido: o código é um shipment que agrega um ou mais
// volumes/pacotes, cada um com seu próprio código de rastreio.
async function obterRastreioShipment(codigoShipment) {
  let response;
  try {
    response = await httpShipments.get(encodeURIComponent(codigoShipment));
  } catch (err) {
    throw new AppError(
      "Não foi possível obter o rastreio no momento. Tente novamente em instantes.",
      502,
      "ERRO_OLIST_ENVIOS"
    );
  }

  return response.data;
}

module.exports = { obterRastreioVolume, obterRastreioShipment };
