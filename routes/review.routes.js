const express = require("express");
const { deleteReview } = require("../controllers/review.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.delete("/:id", requireAuth, deleteReview);

module.exports = router;
