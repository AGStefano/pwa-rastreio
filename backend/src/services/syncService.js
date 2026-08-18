const env = require("../config/env");
const logger = require("../utils/logger");
const { contas } = require("../integrations/tinyContas");
const pedidoRepository = require("../repositories/pedidoRepository");
const syncControlRepository = require("../repositories/syncControlRepository");
const { mapPedidoTinyParaBanco } = require("../repositories/pedidoMapper");
const { parseTinyDate, formatTinyDateTime, subtractMinutes } = require("../utils/datas");

let sincronizacaoEmAndamento = false;

async function buscarResumosAlterados(client, dataAtualizacaoStr) {
  const resumos = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const retorno = await client.pesquisarPedidos({ dataAtualizacao: dataAtualizacaoStr, pagina });
    totalPaginas = retorno.numero_paginas || 1;
    const pedidosDaPagina = (retorno.pedidos || []).map((item) => item.pedido);
    resumos.push(...pedidosDaPagina);
    pagina += 1;
  } while (pagina <= totalPaginas);

  return resumos;
}

async function sincronizarPedido(client, origem, resumo) {
  const detalhe = await client.obterPedido(resumo.id);
  const dados = mapPedidoTinyParaBanco(detalhe, origem);
  const jaExistia = await pedidoRepository.existe(dados.tinyId, origem);
  await pedidoRepository.upsert(dados);
  return jaExistia ? "atualizado" : "novo";
}

// Sincroniza uma única conta Tiny (origem): descobre o que mudou desde a
// última execução DAQUELA conta e faz upsert do detalhe completo de cada uma.
async function sincronizarConta({ origem, client }) {
  const controle = await syncControlRepository.obterOuCriar(origem);
  const desde = controle.lastSyncedAt || parseTinyDate(env.sync.initialDate) || new Date(0);

  // Marca o início desta execução com margem de segurança ANTES de buscar dados,
  // para não perder atualizações que aconteçam durante a própria sincronização.
  const marcaDestaExecucao = subtractMinutes(new Date(), env.sync.safetyMarginMinutes);
  const dataAtualizacaoStr = formatTinyDateTime(desde);

  const resumos = await buscarResumosAlterados(client, dataAtualizacaoStr);
  logger.info(`[${origem}] ${resumos.length} pedido(s) alterado(s) desde ${dataAtualizacaoStr}.`);

  let novos = 0;
  let atualizados = 0;
  const erros = [];

  for (const resumo of resumos) {
    try {
      const resultado = await sincronizarPedido(client, origem, resumo);
      if (resultado === "novo") novos += 1;
      else atualizados += 1;
    } catch (err) {
      erros.push({ id: resumo.id, numero: resumo.numero, mensagem: err.message });
      logger.error(`[${origem}] Falha ao sincronizar pedido id=${resumo.id} numero=${resumo.numero}: ${err.message}`);
    }
  }

  await syncControlRepository.atualizarUltimaSincronizacao(origem, marcaDestaExecucao);

  logger.info(
    `[${origem}] concluído: ${resumos.length} encontrado(s), ${novos} novo(s), ${atualizados} atualizado(s), ${erros.length} erro(s).`
  );

  return { origem, totalEncontrados: resumos.length, novos, atualizados, erros };
}

// Executa uma rodada completa de sincronização, uma conta Tiny de cada vez
// (primeiro filamento, depois impressora — nunca em paralelo: são tokens e
// orçamentos de rate limit independentes, mas mantemos sequencial conforme
// pedido, sem ganho real em paralelizar dado o volume baixo de pedidos).
async function executarSincronizacao({ manual = false } = {}) {
  if (sincronizacaoEmAndamento) {
    logger.warn("Sincronização já está em andamento, execução ignorada.");
    return { ignorada: true };
  }

  sincronizacaoEmAndamento = true;
  const inicio = Date.now();
  logger.info(`Iniciando sincronização${manual ? " (manual)" : ""} (${contas.length} conta(s))...`);

  try {
    const porConta = [];
    for (const conta of contas) {
      try {
        porConta.push(await sincronizarConta(conta));
      } catch (err) {
        logger.error(`[${conta.origem}] Sincronização da conta falhou por completo: ${err.message}`);
        porConta.push({
          origem: conta.origem,
          totalEncontrados: 0,
          novos: 0,
          atualizados: 0,
          erros: [{ mensagem: err.message }],
        });
      }
    }

    const duracaoMs = Date.now() - inicio;
    const resultado = {
      duracaoMs,
      contas: porConta.map((c) => ({
        origem: c.origem,
        totalEncontrados: c.totalEncontrados,
        novos: c.novos,
        atualizados: c.atualizados,
        erros: c.erros.length,
        detalhesErros: c.erros,
      })),
      totalEncontrados: porConta.reduce((soma, c) => soma + c.totalEncontrados, 0),
      novos: porConta.reduce((soma, c) => soma + c.novos, 0),
      atualizados: porConta.reduce((soma, c) => soma + c.atualizados, 0),
      erros: porConta.reduce((soma, c) => soma + c.erros.length, 0),
    };

    logger.info(
      `Sincronização concluída em ${duracaoMs}ms: ${resultado.totalEncontrados} encontrado(s), ` +
        `${resultado.novos} novo(s), ${resultado.atualizados} atualizado(s), ${resultado.erros} erro(s).`
    );

    return resultado;
  } finally {
    sincronizacaoEmAndamento = false;
  }
}

function estaRodando() {
  return sincronizacaoEmAndamento;
}

module.exports = { executarSincronizacao, estaRodando };
