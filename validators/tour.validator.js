const { z } = require("zod");

const itineraryDaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
});

const tourSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters").max(300),
  description: z.string().trim().min(30, "Description must be at least 30 characters"),
  images: z.array(z.string().url("Each image must be a valid URL")).min(1, "Add at least one image"),
  price: z.number().positive("Price must be greater than 0"),
  durationDays: z.number().int().positive("Duration must be at least 1 day"),
  location: z.string().trim().min(2),
  difficulty: z.enum(["EASY", "MODERATE", "CHALLENGING"]),
  maxGroupSize: z.number().int().positive(),
  included: z.array(z.string().trim().min(1)).min(1, "Add at least one inclusion"),
  excluded: z.array(z.string().trim().min(1)).default([]),
  itinerary: z.array(itineraryDaySchema).min(1, "Add at least one itinerary day"),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1, "Select a category"),
});

const tourUpdateSchema = tourSchema.partial();

module.exports = { tourSchema, tourUpdateSchema };
