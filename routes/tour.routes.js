const express = require("express");
const {
  listTours,
  getFeaturedTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  adminListTours,
} = require("../controllers/tour.controller");
const { createReview } = require("../controllers/review.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { tourSchema, tourUpdateSchema } = require("../validators/tour.validator");
const { reviewSchema } = require("../validators/common.validator");

const router = express.Router();

router.get("/", listTours);
router.get("/featured", getFeaturedTours);
router.get("/manage/all", requireAuth, requireRole("ADMIN", "MANAGER"), adminListTours);
router.get("/:slug", getTourBySlug);

router.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), validate(tourSchema), createTour);
router.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), validate(tourUpdateSchema), updateTour);
router.delete("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), deleteTour);

router.post("/:tourId/reviews", requireAuth, validate(reviewSchema), createReview);

module.exports = router;
