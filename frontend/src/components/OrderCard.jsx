import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatarData, formatarMoeda } from "../utils/formatters";

export default function OrderCard({ pedido }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/pedido/${pedido.id}`)}
      className="w-full rounded-xl2 border border-bg-border bg-bg-card p-5 text-left transition hover:border-brand-pink/40 hover:bg-white/[0.03] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-white">Pedido #{pedido.numero}</p>
          <p className="mt-0.5 text-sm text-white/50">{formatarData(pedido.dataPedido)}</p>
        </div>
        <StatusBadge situacao={pedido.situacao} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/50">{pedido.nomeCliente || ""}</span>
        <span className="font-semibold text-brand-lime">Frete: {formatarMoeda(pedido.valorFrete)}</span>
      </div>
    </button>
  );
}
