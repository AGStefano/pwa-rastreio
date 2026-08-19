const logger = require("../utils/logger");
const pedidoRepository = require("../repositories/pedidoRepository");
const olistEnviosClient = require("../integrations/olistEnviosClient");
const { NotFoundError } = require("../utils/errors");

// O Tiny só distingue os dois casos pelo formato do url_rastreamento:
// ".../rastreios/pacote/{codigo}" -> codigo_rastreamento já é de um pacote.
// ".../rastreios/pedido/{codigo}" -> codigo_rastreamento é de um shipment,
// que pode agrupar vários pacotes (cada um com seu próprio código).
function ehRastreioDePedido(pedido) {
  return Boolean(pedido.urlRastreamento && pedido.urlRastreamento.includes("/rastreios/pedido/"));
}

function mapearPacotes(shipment) {
  const volumes = Array.isArray(shipment?.volumes) ? shipment.volumes : [];
  return volumes.map((volume) => {
    const ultimoEvento = Array.isArray(volume.events) ? volume.events[0] : null;
    return {
      trackingCode: volume.tracking_code,
      status: volume.status,
      carrierName: volume.carrier_name,
      carrierSlug: volume.carrier_slug,
      ultimoEvento: ultimoEvento
        ? {
            datetime: ultimoEvento.datetime,
            description: ultimoEvento.description || ultimoEvento.title || null,
            status: ultimoEvento.status,
          }
        : null,
    };
  });
}

async function obterRastreio(id) {
  const pedido = await pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError("Pedido não encontrado.");
  }

  if (!pedido.codigoRastreamento) {
    return {
      situacao: pedido.situacao,
      codigoRastreamento: null,
      tipo: null,
      rastreio: null,
      pacotes: null,
      aviso: "Este pedido ainda não possui código de rastreamento.",
    };
  }

  try {
    if (ehRastreioDePedido(pedido)) {
      const shipment = await olistEnviosClient.obterRastreioShipment(pedido.codigoRastreamento);
      return {
        situacao: pedido.situacao,
        codigoRastreamento: pedido.codigoRastreamento,
        tipo: "pedido",
        rastreio: null,
        pacotes: mapearPacotes(shipment),
        aviso: null,
      };
    }

    const rastreio = await olistEnviosClient.obterRastreioVolume(pedido.codigoRastreamento);
    return {
      situacao: pedido.situacao,
      codigoRastreamento: pedido.codigoRastreamento,
      tipo: "pacote",
      rastreio,
      pacotes: null,
      aviso: null,
    };
  } catch (err) {
    logger.warn(`Falha ao consultar rastreio do pedido ${id}: ${err.message}`);
    return {
      situacao: pedido.situacao,
      codigoRastreamento: pedido.codigoRastreamento,
      tipo: null,
      rastreio: null,
      pacotes: null,
      aviso: "Não foi possível obter o rastreio no momento. Tente novamente em instantes.",
    };
  }
}

// Detalhe completo de um pacote específico de um pedido com vários volumes,
// buscado sob demanda (ex: ao expandir um card no front). Confere que o
// código pertence de fato ao shipment do pedido antes de repassar a consulta.
async function obterRastreioPacote(id, trackingCode) {
  const pedido = await pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError("Pedido não encontrado.");
  }
  if (!pedido.codigoRastreamento || !ehRastreioDePedido(pedido)) {
    throw new NotFoundError("Pacote não encontrado para este pedido.");
  }

  const shipment = await olistEnviosClient.obterRastreioShipment(pedido.codigoRastreamento);
  const volumes = Array.isArray(shipment?.volumes) ? shipment.volumes : [];
  const pertence = volumes.some((volume) => volume.tracking_code === trackingCode);
  if (!pertence) {
    throw new NotFoundError("Pacote não encontrado para este pedido.");
  }

  return olistEnviosClient.obterRastreioVolume(trackingCode);
}

module.exports = { obterRastreio, obterRastreioPacote };
