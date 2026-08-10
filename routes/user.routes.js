const express = require("express");
const {
  updateProfile,
  adminListUsers,
  adminUpdateUserRole,
  adminDeleteUser,
} = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { profileUpdateSchema } = require("../validators/common.validator");

const router = express.Router();

router.patch("/me", requireAuth, validate(profileUpdateSchema), updateProfile);
router.get("/", requireAuth, requireRole("ADMIN"), adminListUsers);
router.patch("/:id/role", requireAuth, requireRole("ADMIN"), adminUpdateUserRole);
router.delete("/:id", requireAuth, requireRole("ADMIN"), adminDeleteUser);

module.exports = router;
