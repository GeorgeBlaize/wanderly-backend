const express = require("express");
const { getAnalytics } = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/analytics", requireAuth, requireRole("ADMIN", "MANAGER"), getAnalytics);

module.exports = router;
