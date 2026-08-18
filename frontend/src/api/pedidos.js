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
