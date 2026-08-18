import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { IconInstall } from "./Icons";

export default function InstallPwaBanner() {
  const { podeInstalar, instalar } = useInstallPrompt();
  const [dispensado, setDispensado] = useState(false);

  if (!podeInstalar || dispensado) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-bg-border bg-bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-action text-white">
            <IconInstall />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Instalar o app</p>
            <p className="text-xs text-white/50">Acesse seus rastreios direto da tela inicial</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setDispensado(true)}
            className="px-2 text-xs text-white/40 hover:text-white/70"
          >
            Agora não
          </button>
          <button
            onClick={instalar}
            className="rounded-lg bg-brand-action px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-action/90"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
