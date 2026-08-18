const { parseTinyDate } = require("../utils/datas");
const { apenasDigitos } = require("../utils/normalizadores");

function montarEndereco(dadosEndereco) {
  if (!dadosEndereco) return null;
  return {
    logradouro: dadosEndereco.endereco || null,
    numero: dadosEndereco.numero || null,
    complemento: dadosEndereco.complemento || null,
    bairro: dadosEndereco.bairro || null,
    cidade: dadosEndereco.cidade || null,
    uf: dadosEndereco.uf || null,
    cep: dadosEndereco.cep || null,
  };
}

function paraFloatOuNull(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const numero = parseFloat(String(valor).replace(",", "."));
  return Number.isNaN(numero) ? null : numero;
}

function paraIntOuNull(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const numero = parseInt(valor, 10);
  return Number.isNaN(numero) ? null : numero;
}

// Converte o pedido completo retornado por pedido.obter.php no formato de linha do banco.
// `origem` identifica de qual conta Tiny (filamento/impressora) esse pedido veio —
// o id do Tiny (tinyId) só é único dentro da própria conta, não entre as duas.
function mapPedidoTinyParaBanco(pedido, origem) {
  const cliente = pedido.cliente || {};
  const telefone = cliente.fone || cliente.celular || null;

  return {
    tinyId: paraIntOuNull(pedido.id),
    origem,
    numero: paraIntOuNull(pedido.numero),
    numeroEcommerce: pedido.numero_ecommerce || null,
    dataPedido: parseTinyDate(pedido.data_pedido),
    dataFaturamento: parseTinyDate(pedido.data_faturamento),
    dataEnvio: parseTinyDate(pedido.data_envio),
    dataEntrega: parseTinyDate(pedido.data_entrega),
    situacao: pedido.situacao || null,
    nomeCliente: cliente.nome || null,
    cpfCnpj: cliente.cpf_cnpj || null,
    cpfCnpjLimpo: apenasDigitos(cliente.cpf_cnpj),
    telefone,
    telefoneLimpo: apenasDigitos(telefone),
    email: cliente.email || null,
    enderecoCobranca: montarEndereco(cliente),
    enderecoEntrega: montarEndereco(pedido.endereco_entrega),
    valorFrete: paraFloatOuNull(pedido.valor_frete),
    formaEnvio: pedido.forma_envio || null,
    formaFrete: pedido.forma_frete || null,
    urlRastreamento: pedido.url_rastreamento || null,
    codigoRastreamento: pedido.codigo_rastreamento || null,
    idNotaFiscal: paraIntOuNull(pedido.id_nota_fiscal),
  };
}

module.exports = { mapPedidoTinyParaBanco };
