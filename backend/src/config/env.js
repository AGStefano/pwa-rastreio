require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function int(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

module.exports = {
  port: int("PORT", 3000),

  databaseUrl: required("DATABASE_URL"),

  tiny: {
    baseUrl: process.env.TINY_API_BASE_URL || "https://api.tiny.com.br/api2/",
    timeoutMs: int("TINY_HTTP_TIMEOUT_MS", 15000),
    // Limite de requisições/min é por token/conta — cada conta tem seu próprio
    // orçamento de 60/min, independente da outra.
    rateLimitPerMinute: int("TINY_RATE_LIMIT_PER_MINUTE", 45),
    retryMaxAttempts: int("TINY_RETRY_MAX_ATTEMPTS", 5),
    retryBaseDelayMs: int("TINY_RETRY_BASE_DELAY_MS", 2000),
    // Duas contas Tiny distintas (mesma API, tokens diferentes) sincronizadas
    // pro mesmo banco. A busca do cliente final não diferencia uma da outra.
    contas: [
      { origem: "filamento", token: required("TINY_API_TOKEN_FILAMENTO") },
      { origem: "impressora", token: required("TINY_API_TOKEN_IMPRESSORA") },
    ],
  },

  olist: {
    trackingBaseUrl:
      process.env.OLIST_ENVIOS_BASE_URL || "https://envios-api.olist.com/v1/bff/volumes/",
    timeoutMs: int("OLIST_HTTP_TIMEOUT_MS", 10000),
  },

  sync: {
    cronIntervalMinutes: int("SYNC_CRON_INTERVAL_MINUTES", 45),
    safetyMarginMinutes: int("SYNC_SAFETY_MARGIN_MINUTES", 5),
    initialDate: process.env.SYNC_INITIAL_DATE || "01/01/2024 00:00:00",
  },

  adminToken: process.env.ADMIN_TOKEN || "",

  // "*" libera qualquer origem (ok para dev). Em produção, defina o domínio do frontend.
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
