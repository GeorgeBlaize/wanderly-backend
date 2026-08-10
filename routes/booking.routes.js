const express = require("express");
const {
  createBooking,
  myBookings,
  cancelBooking,
  adminListBookings,
} = require("../controllers/booking.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { bookingSchema } = require("../validators/common.validator");

const router = express.Router();

router.post("/", requireAuth, validate(bookingSchema), createBooking);
router.get("/mine", requireAuth, myBookings);
router.get("/manage/all", requireAuth, requireRole("ADMIN", "MANAGER"), adminListBookings);
router.patch("/:id/cancel", requireAuth, cancelBooking);

module.exports = router;
