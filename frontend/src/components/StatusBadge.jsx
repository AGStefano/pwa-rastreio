import { estiloDaSituacao } from "../utils/status";

export default function StatusBadge({ situacao, size = "md" }) {
  const estilo = estiloDaSituacao(situacao);
  const tamanho = size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${tamanho} ${estilo.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${estilo.dot}`} />
      {situacao || "Sem status"}
    </span>
  );
}
