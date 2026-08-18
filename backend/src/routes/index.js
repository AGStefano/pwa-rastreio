const { Router } = require("express");
const pedidosRoutes = require("./pedidos.routes");
const syncRoutes = require("./sync.routes");

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/pedidos", pedidosRoutes);
router.use("/sync", syncRoutes);

module.exports = router;
