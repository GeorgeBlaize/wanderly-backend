const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createBooking = asyncHandler(async (req, res) => {
  const { tourId, travelDate, participants } = req.body;

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new ApiError(404, "Tour not found");
  if (participants > tour.maxGroupSize) {
    throw new ApiError(400, `This tour allows a maximum of ${tour.maxGroupSize} participants`);
  }

  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      tourId,
      travelDate,
      participants,
      totalPrice: tour.price * participants,
      status: "CONFIRMED",
    },
    include: { tour: { include: { category: true } } },
  });

  res.status(201).json(new ApiResponse(201, { booking }, "Booking confirmed"));
});

const myBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { tour: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(new ApiResponse(200, { bookings }));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.userId !== req.user.id && req.user.role === "USER") {
    throw new ApiError(403, "You cannot cancel another user's booking");
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  res.status(200).json(new ApiResponse(200, { booking: updated }, "Booking cancelled"));
});

const adminListBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      tour: { select: { id: true, title: true, slug: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(new ApiResponse(200, { bookings }));
});

module.exports = { createBooking, myBookings, cancelBooking, adminListBookings };
