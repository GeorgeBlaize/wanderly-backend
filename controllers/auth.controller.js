const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { generateToken, setAuthCookie } = require("../utils/generateToken");

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "USER", provider: "LOCAL" },
  });

  const token = generateToken(user);
  setAuthCookie(res, token);
  res.status(201).json(new ApiResponse(201, { user: sanitizeUser(user), token }, "Account created"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new ApiError(401, "Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  const token = generateToken(user);
  setAuthCookie(res, token);
  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(user), token }, "Logged in"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json(new ApiResponse(200, null, "Logged out"));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(req.user) }));
});

const googleCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user);
  setAuthCookie(res, token);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  res.redirect(`${clientUrl}/auth/callback?token=${token}`);
});

module.exports = { register, login, logout, me, googleCallback, sanitizeUser };
