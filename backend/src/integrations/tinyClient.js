const axios = require("axios");
const env = require("../config/env");
const logger = require("../utils/logger");
const { Throttle, sleep } = require("../utils/throttle");
const { TinyApiError } = require("../utils/errors");

const http = axios.create({
  baseURL: env.tiny.baseUrl,
  timeout: env.tiny.timeoutMs,
});

const RATE_LIMIT_MESSAGE_PATTERN = /excedid|limite de requisi|muitas requisi/i;

function extrairMensagemErro(retorno) {
  const erros = retorno?.erros;
  if (Array.isArray(erros) && erros.length > 0) {
    return erros.map((e) => e.erro || JSON.stringify(e)).join("; ");
  }
  return "Erro desconhecido retornado pela API do Tiny.";
}

function pareceRateLimit(httpStatus, mensagem) {
  return httpStatus === 429 || RATE_LIMIT_MESSAGE_PATTERN.test(mensagem || "");
}

// Executa uma chamada GET ao Tiny com retry/backoff exponencial em caso de
// rate limit (tanto HTTP 429 quanto o erro específico retornado no corpo JSON).
async function requestComRetry(token, endpoint, params, tentativa = 0) {
  let response;
  try {
    response = await http.get(endpoint, {
      params: { token, formato: "JSON", ...params },
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 429 && tentativa < env.tiny.retryMaxAttempts) {
      const delay = env.tiny.retryBaseDelayMs * 2 ** tentativa;
      logger.warn(`Tiny retornou HTTP 429 em ${endpoint}. Tentando novamente em ${delay}ms.`);
      await sleep(delay);
      return requestComRetry(token, endpoint, params, tentativa + 1);
    }
    throw new TinyApiError(`Falha de conexão com a API do Tiny: ${err.message}`, { retryable: false });
  }

  const retorno = response.data?.retorno;
  if (!retorno) {
    throw new TinyApiError("Resposta inesperada da API do Tiny (sem campo 'retorno').");
  }

  if (retorno.status === "Erro") {
    const mensagem = extrairMensagemErro(retorno);
    if (pareceRateLimit(response.status, mensagem) && tentativa < env.tiny.retryMaxAttempts) {
      const delay = env.tiny.retryBaseDelayMs * 2 ** tentativa;
      logger.warn(`Rate limit do Tiny detectado em ${endpoint}: "${mensagem}". Tentando novamente em ${delay}ms.`);
      await sleep(delay);
      return requestComRetry(token, endpoint, params, tentativa + 1);
    }
    throw new TinyApiError(`Erro da API do Tiny em ${endpoint}: ${mensagem}`);
  }

  return retorno;
}

// Uma instância por conta/token — o rate limit do Tiny é por token, então cada
// conta tem seu próprio orçamento de requisições e sua própria fila.
function criarTinyClient(token) {
  const throttle = new Throttle(env.tiny.rateLimitPerMinute);

  function tinyRequest(endpoint, params) {
    return throttle.schedule(() => requestComRetry(token, endpoint, params));
  }

  return {
    pesquisarPedidos({ dataAtualizacao, pagina = 1 }) {
      return tinyRequest("pedidos.pesquisa.php", { dataAtualizacao, pagina });
    },

    async obterPedido(id) {
      const retorno = await tinyRequest("pedido.obter.php", { id });
      return retorno.pedido;
    },

    async obterLinkNotaFiscal(idNotaFiscal) {
      const retorno = await tinyRequest("nota.fiscal.obter.link.php", { id: idNotaFiscal });
      return retorno.link_nfe;
    },
  };
}

module.exports = { criarTinyClient };
