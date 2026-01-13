import { z } from "zod";

export const flightFormSchema = z.object({
  planeId: z.string().min(1, "Pesawat harus dipilih"),
  price: z.coerce.number().min(1, "Harga tiket harus lebih dari 0"),
  departureCity: z.string().min(1, "Kota keberangkatan harus diisi"),
  departureCityCode: z
    .string()
    .min(2, "Kode kota minimal 2 karakter")
    .max(5, "Kode kota maksimal 5 karakter"),
  departureDate: z.coerce.date({
    required_error: "Tanggal keberangkatan harus diisi",
    invalid_type_error: "Format tanggal tidak valid",
  }),
  destinationCity: z.string().min(1, "Kota tujuan harus diisi"),
  destinationCityCode: z
    .string()
    .min(2, "Kode kota minimal 2 karakter")
    .max(5, "Kode kota maksimal 5 karakter"),
  arrivalDate: z.coerce.date({
    required_error: "Tanggal tiba harus diisi",
    invalid_type_error: "Format tanggal tidak valid",
  }),
});

export type FlightFormData = z.infer<typeof flightFormSchema>;
