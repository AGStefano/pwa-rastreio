const prisma = require("../config/prisma");

// Uma linha por conta (origem) — cada conta Tiny tem seu próprio cursor de
// sincronização, independente da outra.
async function obterOuCriar(origem) {
  const existente = await prisma.syncControl.findUnique({ where: { origem } });
  if (existente) return existente;
  return prisma.syncControl.create({ data: { origem, lastSyncedAt: null } });
}

async function atualizarUltimaSincronizacao(origem, data) {
  return prisma.syncControl.upsert({
    where: { origem },
    create: { origem, lastSyncedAt: data },
    update: { lastSyncedAt: data },
  });
}

module.exports = { obterOuCriar, atualizarUltimaSincronizacao };
