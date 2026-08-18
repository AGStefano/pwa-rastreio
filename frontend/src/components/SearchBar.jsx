import { useState, useEffect } from "react";

export default function SearchBar({ valorInicial = "", onBuscar, carregando }) {
  const [valor, setValor] = useState(valorInicial);

  useEffect(() => setValor(valorInicial), [valorInicial]);

  function handleSubmit(e) {
    e.preventDefault();
    if (valor.trim()) onBuscar(valor.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="CPF, CNPJ, telefone, e-mail ou número do pedido"
          className="w-full rounded-xl2 border border-bg-border bg-bg-card px-5 py-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-brand-action/60 focus:ring-2 focus:ring-brand-action/30"
        />
        <button
          type="submit"
          disabled={carregando || !valor.trim()}
          className="shrink-0 rounded-xl2 bg-brand-action px-8 py-4 font-display font-bold text-white shadow-lg shadow-brand-action/20 transition hover:bg-brand-action/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carregando ? "Buscando..." : "Rastrear"}
        </button>
      </div>
    </form>
  );
}
