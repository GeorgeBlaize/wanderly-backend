const express = require("express");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { categorySchema } = require("../validators/common.validator");

const router = express.Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), validate(categorySchema), createCategory);
router.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), updateCategory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteCategory);

module.exports = router;
