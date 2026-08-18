export function LoadingSpinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-white/50">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-brand-pink" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-xl2 border border-bg-border bg-bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/10" />
        </div>
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 h-3 w-32 rounded bg-white/10" />
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-full bg-white/10" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-xl2 bg-white/5" />
        <div className="h-24 rounded-xl2 bg-white/5" />
        <div className="h-24 rounded-xl2 bg-white/5" />
      </div>
      <div className="h-40 rounded-xl2 bg-white/5" />
      <div className="h-56 rounded-xl2 bg-white/5" />
    </div>
  );
}
