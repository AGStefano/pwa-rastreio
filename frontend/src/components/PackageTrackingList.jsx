import { useState } from "react";
import { obterRastreioPacote, ApiError } from "../api/pedidos";
import TrackingTimeline from "./TrackingTimeline";
import { LoadingSpinner } from "./LoadingSpinner";
import { AvisoMessage } from "./Feedback";
import { formatarDataHora } from "../utils/formatters";

export default function PackageTrackingList({ pedidoId, pacotes }) {
  const [aberto, setAberto] = useState(null);
  const [detalhes, setDetalhes] = useState({});
  const [carregando, setCarregando] = useState(null);
  const [erros, setErros] = useState({});

  if (!pacotes || pacotes.length === 0) {
    return <p className="text-sm text-white/50">Nenhum pacote encontrado para este pedido.</p>;
  }

  async function handleToggle(trackingCode) {
    if (aberto === trackingCode) {
      setAberto(null);
      return;
    }
    setAberto(trackingCode);
    if (detalhes[trackingCode] || carregando === trackingCode) return;

    setCarregando(trackingCode);
    setErros((prev) => ({ ...prev, [trackingCode]: null }));
    try {
      const dados = await obterRastreioPacote(pedidoId, trackingCode);
      setDetalhes((prev) => ({ ...prev, [trackingCode]: dados }));
    } catch (err) {
      setErros((prev) => ({
        ...prev,
        [trackingCode]: err instanceof ApiError ? err.message : "Não foi possível carregar este pacote.",
      }));
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="space-y-3">
      {pacotes.map((pacote) => {
        const expandido = aberto === pacote.trackingCode;
        return (
          <div key={pacote.trackingCode} className="rounded-xl2 border border-bg-border bg-bg-card">
            <button
              type="button"
              onClick={() => handleToggle(pacote.trackingCode)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {pacote.ultimoEvento?.description || "Atualização de rastreio"}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  {[pacote.carrierName, formatarDataHora(pacote.ultimoEvento?.datetime)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-0.5 text-xs text-white/30">Rastreio: {pacote.trackingCode}</p>
              </div>
              <span className={`shrink-0 text-white/40 transition-transform ${expandido ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>

            {expandido && (
              <div className="border-t border-bg-border p-4">
                {carregando === pacote.trackingCode ? (
                  <LoadingSpinner label="Buscando informações do pacote..." />
                ) : erros[pacote.trackingCode] ? (
                  <AvisoMessage mensagem={erros[pacote.trackingCode]} />
                ) : (
                  <TrackingTimeline eventos={detalhes[pacote.trackingCode]?.events} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
