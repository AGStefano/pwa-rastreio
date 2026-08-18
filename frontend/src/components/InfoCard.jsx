export default function InfoCard({ icone, label, valor, destaque = false }) {
  return (
    <div className="rounded-xl2 border border-bg-border bg-bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
        {icone}
        {label}
      </div>
      <p className={`mt-2 font-display text-lg font-bold ${destaque ? "text-brand-lime" : "text-white"}`}>
        {valor || "—"}
      </p>
    </div>
  );
}
