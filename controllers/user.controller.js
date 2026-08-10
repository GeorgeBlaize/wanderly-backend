const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sanitizeUser } = require("./auth.controller");

const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(user) }, "Profile updated"));
});

const adminListUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true, reviews: true } } },
  });
  res.status(200).json(new ApiResponse(200, { users: users.map(sanitizeUser) }));
});

const adminUpdateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["USER", "MANAGER", "ADMIN"].includes(role)) throw new ApiError(400, "Invalid role");
  if (id === req.user.id) throw new ApiError(400, "You cannot change your own role");

  const user = await prisma.user.update({ where: { id }, data: { role } });
  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(user) }, "Role updated"));
});

const adminDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) throw new ApiError(400, "You cannot delete your own account");
  await prisma.user.delete({ where: { id } });
  res.status(200).json(new ApiResponse(200, null, "User deleted"));
});

module.exports = { updateProfile, adminListUsers, adminUpdateUserRole, adminDeleteUser };
