const express = require("express");
const passport = require("passport");
const { register, login, logout, me, googleCallback } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

module.exports = router;
