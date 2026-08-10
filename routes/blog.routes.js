const express = require("express");
const {
  listPosts,
  getPostBySlug,
  adminListPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/blog.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { blogSchema } = require("../validators/common.validator");

const router = express.Router();

router.get("/", listPosts);
router.get("/manage/all", requireAuth, requireRole("ADMIN", "MANAGER"), adminListPosts);
router.get("/:slug", getPostBySlug);

router.post("/", requireAuth, requireRole("ADMIN", "MANAGER"), validate(blogSchema), createPost);
router.patch("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), updatePost);
router.delete("/:id", requireAuth, requireRole("ADMIN", "MANAGER"), deletePost);

module.exports = router;
