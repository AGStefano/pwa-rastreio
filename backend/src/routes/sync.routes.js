const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const requireAdminToken = require("../middleware/requireAdminToken");
const syncService = require("../services/syncService");

const router = Router();

router.post(
  "/run",
  requireAdminToken,
  asyncHandler(async (req, res) => {
    const resultado = await syncService.executarSincronizacao({ manual: true });
    res.json(resultado);
  })
);

module.exports = router;
