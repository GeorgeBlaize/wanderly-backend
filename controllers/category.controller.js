const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { tours: true } } },
    orderBy: { name: "asc" },
  });
  res.status(200).json(new ApiResponse(200, { categories }));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, imageUrl } = req.body;
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) throw new ApiError(409, "A category with this name already exists");

  const category = await prisma.category.create({ data: { name, slug, imageUrl } });
  res.status(201).json(new ApiResponse(201, { category }, "Category created"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl } = req.body;

  const data = { imageUrl };
  if (name) {
    data.name = name;
    data.slug = slugify(name);
  }

  const category = await prisma.category.update({ where: { id }, data });
  res.status(200).json(new ApiResponse(200, { category }, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tourCount = await prisma.tour.count({ where: { categoryId: id } });
  if (tourCount > 0) {
    throw new ApiError(409, "Cannot delete a category that still has tours assigned to it");
  }
  await prisma.category.delete({ where: { id } });
  res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, slugify };
