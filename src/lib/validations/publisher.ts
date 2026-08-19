import { z } from "zod";

// ─── Become Publisher Application Schema ───
export const becomePublisherSchema = z.object({
  portfolioLinks: z
    .array(
      z.object({
        value: z.string().url("Please enter a valid portfolio URL (e.g., https://dribbble.com/yourname)"),
      })
    )
    .min(1, "Please provide at least 1 portfolio link")
    .max(3, "You can submit at most 3 portfolio links"),
  websiteUrl: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
  motivation: z
    .string()
    .max(500, "Motivation cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  experience: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type BecomePublisherFormData = z.infer<typeof becomePublisherSchema>;

// ─── Publisher New Product Upload Schema ───
export const publisherProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  price: z
    .number()
    .min(0, "Price cannot be negative"),
  overview: z
    .string()
    .min(15, "Overview must be at least 15 characters")
    .max(2000, "Overview cannot exceed 2000 characters"),
  category: z
    .string()
    .min(1, "Please select a category"),
  subCategories: z
    .array(z.string()),
  tags: z
    .array(z.string())
    .min(1, "Select at least 1 tag")
    .max(8, "Maximum 8 tags allowed"),
  highlights: z
    .array(z.object({ value: z.string().min(1, "Feature highlight cannot be empty") }))
    .min(1, "Add at least 1 key feature highlight"),
  includedFiles: z
    .array(z.string())
    .min(1, "Select at least 1 included file format"),
});

export type PublisherProductFormData = z.infer<typeof publisherProductSchema>;
