import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useUltimaBusca } from "../hooks/useUltimaBusca";

export default function SearchPage() {
  const navigate = useNavigate();
  const { valorSalvo, salvar, limpar } = useUltimaBusca();

  function handleBuscar(query) {
    salvar(query);
    navigate(`/pedido/${encodeURIComponent(query)}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-24 pt-14">
      <header className="mb-10 text-center">
        <img
          src="https://stlflix.com/wp-content/uploads/2026/05/Logo.png"
          width="409"
          height="108"
          alt="STLFLIX"
          className="mx-auto h-12 w-auto"
        />
        <p className="mt-2 text-sm text-white/50">Rastreie seu pedido</p>
      </header>

      <SearchBar valorInicial={valorSalvo} onBuscar={handleBuscar} carregando={false} />

      {valorSalvo && (
        <button onClick={limpar} className="mt-2 self-end text-xs text-white/35 hover:text-white/60">
          Limpar busca salva ×
        </button>
      )}
    </div>
  );
}
