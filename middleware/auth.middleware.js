const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../config/db");

function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, "Authentication required");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never blocks the request.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (user) req.user = user;
  } catch {
    // ignore invalid/expired token for optional auth
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
