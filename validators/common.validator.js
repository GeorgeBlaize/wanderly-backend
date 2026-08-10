const { z } = require("zod");

const bookingSchema = z.object({
  tourId: z.string().min(1, "Tour is required"),
  travelDate: z.coerce.date({ error: "Enter a valid travel date" }),
  participants: z.number().int().positive("At least 1 participant is required"),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Comment must be at least 5 characters").max(1000),
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  imageUrl: z.string().url("Enter a valid image URL"),
});

const blogSchema = z.object({
  title: z.string().trim().min(3).max(150),
  coverImage: z.string().url("Enter a valid image URL"),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(30),
  tags: z.array(z.string().trim().min(1)).default([]),
  author: z.string().trim().min(2),
  published: z.boolean().optional(),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  avatarUrl: z.string().url("Enter a valid image URL").optional(),
});

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

module.exports = {
  bookingSchema,
  reviewSchema,
  contactSchema,
  categorySchema,
  blogSchema,
  profileUpdateSchema,
  newsletterSchema,
};
