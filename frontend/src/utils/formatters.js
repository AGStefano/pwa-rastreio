export function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatarDataHora(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarMoeda(valor) {
  const numero = Number(valor);
  if (valor === null || valor === undefined || Number.isNaN(numero)) return "—";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarEndereco(endereco) {
  if (!endereco) return null;
  const { logradouro, numero, complemento, bairro, cidade, uf, cep } = endereco;
  const linha1 = [logradouro, numero].filter(Boolean).join(", ");
  const linha2 = [complemento].filter(Boolean).join("");
  const linha3 = [bairro, [cidade, uf].filter(Boolean).join("/")].filter(Boolean).join(" - ");
  return { linha1: linha1 || null, linha2: linha2 || null, linha3: linha3 || null, cep: cep || null };
}
