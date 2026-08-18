import { useEffect, useState } from "react";

// Captura o beforeinstallprompt para controlar nosso próprio botão de instalação,
// em vez de depender do prompt nativo (inconsistente entre navegadores/dispositivos).
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    function aoTerPromptDisponivel(evento) {
      evento.preventDefault();
      setDeferredPrompt(evento);
    }

    function aoInstalar() {
      setInstalado(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", aoTerPromptDisponivel);
    window.addEventListener("appinstalled", aoInstalar);

    return () => {
      window.removeEventListener("beforeinstallprompt", aoTerPromptDisponivel);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return {
    podeInstalar: Boolean(deferredPrompt) && !instalado,
    instalar,
  };
}
