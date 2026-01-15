import { z } from "zod";

export const flightAddonFormSchema = z.object({
  code: z
    .string({ required_error: "Code is required" })
    .min(3, "Code must be at least 3 characters"),
  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.string({ required_error: "Price is required" }),
});
