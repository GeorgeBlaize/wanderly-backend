const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// Aggregates real seeded/booked data for the admin analytics dashboard (no mock numbers).
const getAnalytics = asyncHandler(async (req, res) => {
  const [userCount, tourCount, bookingCount, revenueAgg, bookingsByStatus, categories] =
    await Promise.all([
      prisma.user.count(),
      prisma.tour.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.booking.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.category.findMany({ include: { _count: { select: { tours: true } } } }),
    ]);

  const bookings = await prisma.booking.findMany({
    where: { status: { not: "CANCELLED" } },
    select: { createdAt: true, totalPrice: true },
  });

  const monthly = {};
  for (const b of bookings) {
    const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + b.totalPrice;
  }
  const revenueByMonth = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const bookingsByCategoryRaw = await prisma.booking.findMany({
    where: { status: { not: "CANCELLED" } },
    select: { tour: { select: { category: { select: { name: true } } } } },
  });
  const byCategory = {};
  for (const b of bookingsByCategoryRaw) {
    const name = b.tour.category.name;
    byCategory[name] = (byCategory[name] || 0) + 1;
  }
  const bookingsByCategory = Object.entries(byCategory).map(([name, count]) => ({ name, count }));

  res.status(200).json(
    new ApiResponse(200, {
      totals: {
        users: userCount,
        tours: tourCount,
        bookings: bookingCount,
        revenue: revenueAgg._sum.totalPrice || 0,
      },
      bookingsByStatus: bookingsByStatus.map((b) => ({ status: b.status, count: b._count.status })),
      revenueByMonth,
      bookingsByCategory,
      categories: categories.map((c) => ({ name: c.name, tours: c._count.tours })),
    })
  );
});

module.exports = { getAnalytics };
