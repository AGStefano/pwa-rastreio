const logger = require("../utils/logger");
const pedidoRepository = require("../repositories/pedidoRepository");
const olistEnviosClient = require("../integrations/olistEnviosClient");
const { NotFoundError } = require("../utils/errors");

async function obterRastreio(id) {
  const pedido = await pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError("Pedido não encontrado.");
  }

  if (!pedido.codigoRastreamento) {
    return {
      situacao: pedido.situacao,
      codigoRastreamento: null,
      rastreio: null,
      aviso: "Este pedido ainda não possui código de rastreamento.",
    };
  }

  try {
    const rastreio = await olistEnviosClient.obterRastreio(pedido.codigoRastreamento);
    return {
      situacao: pedido.situacao,
      codigoRastreamento: pedido.codigoRastreamento,
      rastreio,
      aviso: null,
    };
  } catch (err) {
    logger.warn(`Falha ao consultar rastreio do pedido ${id}: ${err.message}`);
    return {
      situacao: pedido.situacao,
      codigoRastreamento: pedido.codigoRastreamento,
      rastreio: null,
      aviso: "Não foi possível obter o rastreio no momento. Tente novamente em instantes.",
    };
  }
}

module.exports = { obterRastreio };
