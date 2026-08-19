const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const pedidoService = require("../services/pedidoService");
const rastreioService = require("../services/rastreioService");
const notaFiscalService = require("../services/notaFiscalService");
const { AppError } = require("../utils/errors");

const router = Router();

// Postgres INT4 (nossa coluna "id") vai até 2147483647. Qualquer coisa fora
// disso (ex: CPF/telefone com 11+ dígitos) não pode ser um id interno válido
// e quebraria o driver do Postgres antes mesmo de chegar no banco.
const INT4_MAX = 2147483647;

function parseIdOuErro(req) {
  const bruto = req.params.id;
  if (!/^\d+$/.test(bruto) || Number(bruto) > INT4_MAX) {
    throw new AppError("Identificador de pedido inválido.", 400, "ID_INVALIDO");
  }
  return parseInt(bruto, 10);
}

router.get(
  "/buscar",
  asyncHandler(async (req, res) => {
    const query = String(req.query.query || "");
    if (!query.trim()) {
      throw new AppError("Informe um valor para busca (query).", 400, "QUERY_OBRIGATORIA");
    }
    const pedidos = await pedidoService.buscar(query);
    res.json({ resultados: pedidos });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseIdOuErro(req);
    const pedido = await pedidoService.obterPorId(id);
    res.json(pedido);
  })
);

router.get(
  "/:id/rastreio",
  asyncHandler(async (req, res) => {
    const id = parseIdOuErro(req);
    const resultado = await rastreioService.obterRastreio(id);
    res.json(resultado);
  })
);

router.get(
  "/:id/rastreio/pacotes/:trackingCode",
  asyncHandler(async (req, res) => {
    const id = parseIdOuErro(req);
    const resultado = await rastreioService.obterRastreioPacote(id, req.params.trackingCode);
    res.json(resultado);
  })
);

router.get(
  "/:id/nota-fiscal",
  asyncHandler(async (req, res) => {
    const id = parseIdOuErro(req);
    const { stream, filename } = await notaFiscalService.obterArquivoNotaFiscal(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  })
);

module.exports = router;
