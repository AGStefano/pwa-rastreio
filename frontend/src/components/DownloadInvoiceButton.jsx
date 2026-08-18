import { useState } from "react";
import { baixarNotaFiscal } from "../api/pedidos";
import { IconDocument } from "./Icons";

export default function DownloadInvoiceButton({ pedidoId, numeroPedido, disponivel }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleClick() {
    setBaixando(true);
    setErro(null);
    try {
      await baixarNotaFiscal(pedidoId, `nota-fiscal-pedido-${numeroPedido}.pdf`);
    } catch (err) {
      setErro(err.message || "Não foi possível baixar a nota fiscal.");
    } finally {
      setBaixando(false);
    }
  }

  if (!disponivel) {
    return (
      <div className="flex items-center gap-2 rounded-xl2 border border-bg-border bg-bg-card px-5 py-3 text-sm text-white/40">
        <IconDocument />
        Nota fiscal ainda não disponível
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={baixando}
        className="flex items-center gap-2 rounded-xl2 border border-bg-border bg-bg-card px-5 py-3 text-sm font-medium text-white transition hover:border-brand-lime/50 hover:text-brand-lime disabled:cursor-wait disabled:opacity-60"
      >
        <IconDocument />
        {baixando ? "Baixando..." : "Baixar nota fiscal (PDF)"}
      </button>
      {erro && <p className="mt-2 text-xs text-status-danger">{erro}</p>}
    </div>
  );
}
