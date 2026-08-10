const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

async function recalculateTourRating(tourId) {
  const agg = await prisma.review.aggregate({
    where: { tourId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.tour.update({
    where: { id: tourId },
    data: {
      avgRating: agg._avg.rating || 0,
      reviewCount: agg._count.rating,
    },
  });
}

const createReview = asyncHandler(async (req, res) => {
  const { tourId } = req.params;
  const { rating, comment } = req.body;

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new ApiError(404, "Tour not found");

  const hasBooking = await prisma.booking.findFirst({
    where: { tourId, userId: req.user.id, status: { not: "CANCELLED" } },
  });
  if (!hasBooking) throw new ApiError(403, "Only travelers who booked this tour can leave a review");

  const existing = await prisma.review.findUnique({
    where: { userId_tourId: { userId: req.user.id, tourId } },
  });
  if (existing) throw new ApiError(409, "You already reviewed this tour");

  const review = await prisma.review.create({
    data: { tourId, userId: req.user.id, rating, comment },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await recalculateTourRating(tourId);
  res.status(201).json(new ApiResponse(201, { review }, "Review submitted"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new ApiError(404, "Review not found");
  if (review.userId !== req.user.id && req.user.role === "USER") {
    throw new ApiError(403, "You cannot delete another user's review");
  }

  await prisma.review.delete({ where: { id } });
  await recalculateTourRating(review.tourId);
  res.status(200).json(new ApiResponse(200, null, "Review deleted"));
});

module.exports = { createReview, deleteReview };
