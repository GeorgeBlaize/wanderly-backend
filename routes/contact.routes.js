const express = require("express");
const { submitContact, adminListMessages, subscribeNewsletter } = require("../controllers/contact.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { contactSchema, newsletterSchema } = require("../validators/common.validator");

const router = express.Router();

router.post("/", validate(contactSchema), submitContact);
router.get("/manage/all", requireAuth, requireRole("ADMIN", "MANAGER"), adminListMessages);
router.post("/newsletter", validate(newsletterSchema), subscribeNewsletter);

module.exports = router;
