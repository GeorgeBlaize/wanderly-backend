const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  phone: z.string().trim().max(20).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
