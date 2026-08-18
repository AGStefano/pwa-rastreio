// Classifica as situações em português vindas do Tiny ERP em categorias visuais.
const REGRAS = [
  { categoria: "success", termos: ["entregue"] },
  { categoria: "danger", termos: ["cancelad", "nao entregue", "não entregue", "extrav"] },
  { categoria: "progress", termos: ["enviad", "caminho", "transit", "trânsit", "faturad", "pronto para envio"] },
  { categoria: "pending", termos: ["aberto", "aprovad", "preparando"] },
];

const ESTILOS = {
  success: { badge: "bg-status-success/15 text-status-success border-status-success/30", dot: "bg-status-success" },
  danger: { badge: "bg-status-danger/15 text-status-danger border-status-danger/30", dot: "bg-status-danger" },
  progress: { badge: "bg-status-progress/15 text-brand-pink border-status-progress/30", dot: "bg-status-progress" },
  pending: { badge: "bg-status-pending/15 text-status-pending border-status-pending/30", dot: "bg-status-pending" },
  desconhecido: { badge: "bg-white/10 text-white/70 border-white/15", dot: "bg-white/40" },
};

export function classificarSituacao(situacao) {
  const texto = (situacao || "").toLowerCase();
  const regra = REGRAS.find((r) => r.termos.some((t) => texto.includes(t)));
  return regra ? regra.categoria : "desconhecido";
}

export function estiloDaSituacao(situacao) {
  return ESTILOS[classificarSituacao(situacao)];
}
