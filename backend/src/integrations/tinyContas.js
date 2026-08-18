const env = require("../config/env");
const { criarTinyClient } = require("./tinyClient");

// Uma entrada por conta Tiny configurada (origem + cliente HTTP já com o
// token e o throttle daquela conta). É por aqui que o resto do backend
// descobre quais contas existem e como falar com cada uma.
const contas = env.tiny.contas.map((conta) => ({
  origem: conta.origem,
  client: criarTinyClient(conta.token),
}));

function clientPorOrigem(origem) {
  const conta = contas.find((c) => c.origem === origem);
  if (!conta) {
    throw new Error(`Nenhuma conta Tiny configurada para a origem "${origem}".`);
  }
  return conta.client;
}

module.exports = { contas, clientPorOrigem };
