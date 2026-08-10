const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { slugify } = require("./category.controller");

const listPosts = asyncHandler(async (req, res) => {
  const { page = "1", limit = "6" } = req.query;
  const take = Math.min(Number(limit) || 6, 30);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = { published: true };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.blogPost.count({ where }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { total, page: Number(page) || 1, limit: take, totalPages: Math.max(Math.ceil(total / take), 1) },
    })
  );
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
  if (!post) throw new ApiError(404, "Blog post not found");
  res.status(200).json(new ApiResponse(200, { post }));
});

const adminListPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json(new ApiResponse(200, { posts }));
});

const createPost = asyncHandler(async (req, res) => {
  const data = req.body;
  let slug = slugify(data.title);
  let counter = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${slugify(data.title)}-${counter++}`;
  }
  const post = await prisma.blogPost.create({ data: { ...data, slug } });
  res.status(201).json(new ApiResponse(201, { post }, "Post published"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await prisma.blogPost.update({ where: { id }, data: req.body });
  res.status(200).json(new ApiResponse(200, { post }, "Post updated"));
});

const deletePost = asyncHandler(async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.status(200).json(new ApiResponse(200, null, "Post deleted"));
});

module.exports = { listPosts, getPostBySlug, adminListPosts, createPost, updatePost, deletePost };
