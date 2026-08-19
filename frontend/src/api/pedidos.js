import request, { ApiError } from "./client";

export async function buscarPedidos(query) {
  const data = await request(`/pedidos/buscar?query=${encodeURIComponent(query)}`);
  return data.resultados;
}

export async function obterPedido(id) {
  return request(`/pedidos/${id}`);
}

export async function obterRastreio(id) {
  return request(`/pedidos/${id}/rastreio`);
}

// Detalhe completo de um pacote específico, para pedidos com vários volumes
// (buscado sob demanda quando o usuário expande o card do pacote).
export async function obterRastreioPacote(id, trackingCode) {
  return request(`/pedidos/${id}/rastreio/pacotes/${encodeURIComponent(trackingCode)}`);
}

// Baixa o PDF da nota fiscal e dispara o download no navegador.
export async function baixarNotaFiscal(id, nomeArquivoSugerido) {
  const blob = await request(`/pedidos/${id}/nota-fiscal`, { responseType: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivoSugerido || `nota-fiscal-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export { ApiError };
