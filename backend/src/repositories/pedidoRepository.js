const prisma = require("../config/prisma");

const CAMPOS_RESUMO = {
  id: true,
  numero: true,
  numeroEcommerce: true,
  dataPedido: true,
  situacao: true,
  valorFrete: true,
  nomeCliente: true,
};

// tinyId só é único dentro da própria conta Tiny — a identidade real do
// pedido, pra fins de upsert, é o par (tinyId, origem).
async function existe(tinyId, origem) {
  const encontrado = await prisma.pedido.findUnique({
    where: { tinyId_origem: { tinyId, origem } },
    select: { id: true },
  });
  return Boolean(encontrado);
}

async function upsert(dados) {
  const { tinyId, origem, ...resto } = dados;
  return prisma.pedido.upsert({
    where: { tinyId_origem: { tinyId, origem } },
    create: { tinyId, origem, ...resto },
    update: resto,
  });
}

async function buscarPorId(id) {
  return prisma.pedido.findUnique({ where: { id } });
}

// Busca livre: aceita CPF/CNPJ, telefone, e-mail, número do pedido Tiny ou número do e-commerce,
// com ou sem máscara/pontuação.
//
// Importante: todos os campos usam match EXATO (após normalizar), nunca "contains".
// Um "contains" em cpf/telefone permitiria que uma busca aleatória (ex: "545")
// batesse por coincidência com um trecho do CPF/telefone de qualquer outro
// cliente e vazasse os dados de pedido de terceiros — o objetivo aqui é só
// tolerar máscara/pontuação, não fazer busca parcial/fuzzy.
async function buscarPorTermo(termoBruto) {
  const termo = termoBruto.trim();
  if (!termo) return [];

  const digitos = termo.replace(/\D/g, "");
  // Limite de 9 dígitos evita estourar o INT4 do Postgres e também evita comparar
  // CPF/CNPJ (11-14 dígitos) com o campo "numero" (número do pedido no Tiny).
  const numeroComoInteiro =
    digitos && digitos.length <= 9 && /^\d+$/.test(digitos) ? parseInt(digitos, 10) : null;

  const or = [
    { email: { equals: termo, mode: "insensitive" } },
    { numeroEcommerce: { equals: termo, mode: "insensitive" } },
  ];

  if (digitos) {
    or.push({ cpfCnpjLimpo: { equals: digitos } });
    or.push({ telefoneLimpo: { equals: digitos } });
    if (digitos !== termo) or.push({ numeroEcommerce: { equals: digitos } });
  }

  if (numeroComoInteiro !== null) {
    or.push({ numero: numeroComoInteiro });
  }

  return prisma.pedido.findMany({
    where: { OR: or },
    select: CAMPOS_RESUMO,
    orderBy: { dataPedido: "desc" },
    take: 50,
  });
}

module.exports = { existe, upsert, buscarPorId, buscarPorTermo };
