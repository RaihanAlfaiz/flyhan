import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 2000000; // 2 MB

export const airplaneFormSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Nama Pesawat harus memiliki minimal 4 karakter" }),
  code: z.string().regex(/^[A-Z]{3}-[0-9]{3}$/, "Format kode harus [XXX-111]"),
  image: z
    .any()
    .refine(
      (file: File) => file instanceof File && file.size > 0,
      "Image harus diupload"
    )
    .refine(
      (file: File) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Image harus berekstensi jpg, jpeg, dan png"
    )
    .refine(
      (file: File) => file?.size <= MAX_FILE_SIZE,
      "Image harus memiliki ukuran maksimal 2MB"
    ),
});
