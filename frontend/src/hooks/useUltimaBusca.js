import { useCallback, useState } from "react";

const CHAVE = "ultima_busca";

export function useUltimaBusca() {
  const [valorSalvo, setValorSalvo] = useState(() => localStorage.getItem(CHAVE) || "");

  const salvar = useCallback((valor) => {
    if (valor) {
      localStorage.setItem(CHAVE, valor);
    } else {
      localStorage.removeItem(CHAVE);
    }
    setValorSalvo(valor || "");
  }, []);

  const limpar = useCallback(() => {
    localStorage.removeItem(CHAVE);
    setValorSalvo("");
  }, []);

  return { valorSalvo, salvar, limpar };
}
