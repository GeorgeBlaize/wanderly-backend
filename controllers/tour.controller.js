const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { slugify } = require("./category.controller");

const listTours = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    difficulty,
    sort = "newest",
    page = "1",
    limit = "9",
  } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { slug: category };
  if (difficulty) where.difficulty = difficulty;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy =
    {
      newest: { createdAt: "desc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      rating: { avgRating: "desc" },
    }[sort] || { createdAt: "desc" };

  const take = Math.min(Number(limit) || 9, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: true },
    }),
    prisma.tour.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      tours,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: take,
        totalPages: Math.max(Math.ceil(total / take), 1),
      },
    })
  );
});

const getFeaturedTours = asyncHandler(async (req, res) => {
  const tours = await prisma.tour.findMany({
    where: { featured: true },
    orderBy: { avgRating: "desc" },
    take: 6,
    include: { category: true },
  });
  res.status(200).json(new ApiResponse(200, { tours }));
});

const getTourBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!tour) throw new ApiError(404, "Tour not found");

  const related = await prisma.tour.findMany({
    where: { categoryId: tour.categoryId, id: { not: tour.id } },
    take: 3,
    include: { category: true },
  });

  res.status(200).json(new ApiResponse(200, { tour, related }));
});

async function generateUniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (await prisma.tour.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

const createTour = asyncHandler(async (req, res) => {
  const data = req.body;
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new ApiError(400, "Selected category does not exist");

  const slug = await generateUniqueSlug(data.title);

  const tour = await prisma.tour.create({
    data: { ...data, slug, createdById: req.user.id },
    include: { category: true },
  });
  res.status(201).json(new ApiResponse(201, { tour }, "Tour created"));
});

const updateTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.tour.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Tour not found");

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new ApiError(400, "Selected category does not exist");
  }

  if (data.title && data.title !== existing.title) {
    data.slug = await generateUniqueSlug(data.title);
  }

  const tour = await prisma.tour.update({ where: { id }, data, include: { category: true } });
  res.status(200).json(new ApiResponse(200, { tour }, "Tour updated"));
});

const deleteTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.tour.delete({ where: { id } });
  res.status(200).json(new ApiResponse(200, null, "Tour deleted"));
});

const adminListTours = asyncHandler(async (req, res) => {
  const tours = await prisma.tour.findMany({
    include: { category: true, _count: { select: { bookings: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(new ApiResponse(200, { tours }));
});

module.exports = {
  listTours,
  getFeaturedTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  adminListTours,
};
