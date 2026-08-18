const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = "GET", responseType = "json", signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Permite que o chamador também aborte (ex: unmount de componente).
  if (signal) signal.addEventListener("abort", () => controller.abort());

  try {
    const res = await fetch(`${BASE_URL}${path}`, { method, signal: controller.signal });

    if (!res.ok) {
      let mensagem = "Ocorreu um erro ao falar com o servidor.";
      let code = "ERRO_DESCONHECIDO";
      try {
        const body = await res.json();
        mensagem = body?.error?.message || mensagem;
        code = body?.error?.code || code;
      } catch {
        // corpo não era JSON, mantém mensagem genérica
      }
      throw new ApiError(mensagem, res.status, code);
    }

    if (responseType === "blob") return res.blob();
    if (responseType === "none") return null;
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("A requisição demorou demais para responder.", 0, "TIMEOUT");
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError("Não foi possível conectar ao servidor.", 0, "ERRO_CONEXAO");
  } finally {
    clearTimeout(timeoutId);
  }
}

export default request;
