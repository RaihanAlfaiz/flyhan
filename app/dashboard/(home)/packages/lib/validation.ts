import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 2000000; // 2MB

export const packageFormSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(4, { message: "Title must be at least 4 characters" }),
  price: z.string({ required_error: "Price is required" }), // We'll coerce in action
  description: z
    .string({ required_error: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" }),
  image: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional()
    .or(z.string().min(1)), // Accept string if already uploaded (edit mode) or during initial validation if handled differently
  features: z
    .string({ required_error: "Features are required" })
    .min(3, { message: "Features must be at least 3 characters" }),
});
