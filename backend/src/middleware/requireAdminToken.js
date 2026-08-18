const env = require("../config/env");

// Proteção simples e opcional para endpoints administrativos. Se ADMIN_TOKEN
// não estiver configurado, o endpoint fica liberado (útil em desenvolvimento).
function requireAdminToken(req, res, next) {
  if (!env.adminToken) return next();

  const token = req.header("x-admin-token");
  if (token && token === env.adminToken) return next();

  return res.status(401).json({
    error: { code: "NAO_AUTORIZADO", message: "Token de administrador inválido ou ausente." },
  });
}

module.exports = requireAdminToken;
