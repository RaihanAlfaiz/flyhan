import { z } from "zod";

export const flightFormSchema = z.object({
  planeId: z.string().min(1, "Pesawat harus dipilih"),
  price: z.coerce.number().min(1, "Harga tiket harus lebih dari 0"),
  priceEconomy: z.coerce.number().min(0, "Harga Economy harus diisi"),
  priceBusiness: z.coerce.number().min(0, "Harga Business harus diisi"),
  priceFirst: z.coerce.number().min(0, "Harga First Class harus diisi"),
  seatConfig: z.string().min(2, "Konfigurasi kursi harus diisi"),
  departureCity: z.string().min(1, "Kota keberangkatan harus diisi"),
  departureCityCode: z
    .string()
    .min(2, "Kode kota minimal 2 karakter")
    .max(5, "Kode kota maksimal 5 karakter"),
  departureDate: z.coerce.date(),
  destinationCity: z.string().min(1, "Kota tujuan harus diisi"),
  destinationCityCode: z
    .string()
    .min(2, "Kode kota minimal 2 karakter")
    .max(5, "Kode kota maksimal 5 karakter"),
  arrivalDate: z.coerce.date(),
});

export type FlightFormData = z.infer<typeof flightFormSchema>;
