export function EmptyState({ titulo, mensagem }) {
  return (
    <div className="rounded-xl2 border border-dashed border-bg-border bg-bg-card/50 p-8 text-center">
      <p className="font-display font-semibold text-white">{titulo}</p>
      {mensagem && <p className="mt-1.5 text-sm text-white/50">{mensagem}</p>}
    </div>
  );
}

export function ErrorMessage({ mensagem }) {
  return (
    <div className="rounded-xl2 border border-status-danger/30 bg-status-danger/10 p-4 text-sm text-status-danger">
      {mensagem}
    </div>
  );
}

export function AvisoMessage({ mensagem }) {
  return (
    <div className="rounded-xl2 border border-status-pending/30 bg-status-pending/10 p-4 text-sm text-status-pending">
      {mensagem}
    </div>
  );
}
