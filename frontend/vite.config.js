import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Config do PWA isolada aqui para ficar fácil de achar quando entrarmos em push notification.
const pwaOptions = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
  manifest: {
    name: "STLFLIX Rastreio",
    short_name: "Rastreio",
    description: "Acompanhe o status e a entrega dos seus pedidos STLFLIX em tempo real.",
    theme_color: "#0a0a0f",
    background_color: "#0a0a0f",
    display: "standalone",
    // Ordem de preferência: navegadores mais novos tentam "standalone" e só
    // caem pro próximo se o anterior não for suportado — reforça o modo app
    // (sem barra de endereço) em mais versões de Chrome/Android.
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    start_url: "/",
    scope: "/",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: {
    // Assets estáticos da própria aplicação (JS/CSS/ícones) via precache do Workbox
    // (comportamento padrão do generateSW) = cache-first.
    globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
    // Chamadas à API nunca devem servir dado velho por padrão: tenta a rede primeiro,
    // só cai pro cache se a rede falhar/der timeout.
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  // SW só ativo em build de produção (npm run build && npm run preview).
  // Testar instalação/SW em dev exige rodar o preview, não o `vite dev`.
  devOptions: { enabled: false },
};

export default defineConfig({
  plugins: [react(), VitePWA(pwaOptions)],
  // host: true = escuta em todas as interfaces (0.0.0.0), não só localhost,
  // para dar pra acessar de outro dispositivo (celular) na mesma rede.
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
