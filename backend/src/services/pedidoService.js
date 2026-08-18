const pedidoRepository = require("../repositories/pedidoRepository");
const { NotFoundError } = require("../utils/errors");

async function buscar(query) {
  if (!query || !query.trim()) {
    return [];
  }
  return pedidoRepository.buscarPorTermo(query);
}

async function obterPorId(id) {
  const pedido = await pedidoRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError("Pedido não encontrado.");
  }
  return pedido;
}

module.exports = { buscar, obterPorId };
