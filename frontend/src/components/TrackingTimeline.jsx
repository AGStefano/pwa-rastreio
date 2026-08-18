import { formatarDataHora } from "../utils/formatters";

export default function TrackingTimeline({ eventos }) {
  if (!eventos || eventos.length === 0) {
    return <p className="text-sm text-white/50">Nenhum evento de rastreio disponível ainda.</p>;
  }

  return (
    <ol className="relative">
      {eventos.map((evento, idx) => {
        const ultimo = idx === eventos.length - 1;
        return (
          <li key={idx} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${idx === 0 ? "bg-brand-gradient" : "bg-white/25"}`}
              />
              {!ultimo && <span className="mt-1 w-px flex-1 bg-white/10" />}
            </div>
            <div className="-mt-1">
              <p className={`text-sm font-medium ${idx === 0 ? "text-white" : "text-white/70"}`}>
                {evento.title || evento.status || "Atualização de rastreio"}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                {[evento.location, formatarDataHora(evento.datetime)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
