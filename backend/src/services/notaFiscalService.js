const axios = require("axios");
const env = require("../config/env");
const pedidoRepository = require("../repositories/pedidoRepository");
const { clientPorOrigem } = require("../integrations/tinyContas");
const { NotFoundError, AppError } = require("../utils/errors");

// Busca o link do PDF no Tiny (usando o cliente da conta de origem do pedido)
// e baixa o arquivo, para o controller fazer o proxy dos bytes ao cliente
// (o usuário nunca vê a URL da Olist).
async function obterArquivoNotaFiscal(id) {
  const pedido = await pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError("Pedido não encontrado.");
  }
  if (!pedido.idNotaFiscal) {
    throw new NotFoundError("Nota fiscal ainda não disponível para este pedido.");
  }

  const linkNfe = await clientPorOrigem(pedido.origem).obterLinkNotaFiscal(pedido.idNotaFiscal);
  if (!linkNfe) {
    throw new AppError("Link da nota fiscal não retornado pelo Tiny.", 502, "ERRO_TINY_API");
  }

  let respostaPdf;
  try {
    respostaPdf = await axios.get(linkNfe, {
      responseType: "stream",
      timeout: env.tiny.timeoutMs,
    });
  } catch (err) {
    throw new AppError("Não foi possível baixar o PDF da nota fiscal.", 502, "ERRO_DOWNLOAD_NF");
  }

  return {
    stream: respostaPdf.data,
    filename: `nota-fiscal-pedido-${pedido.numero || pedido.id}.pdf`,
  };
}

module.exports = { obterArquivoNotaFiscal };
