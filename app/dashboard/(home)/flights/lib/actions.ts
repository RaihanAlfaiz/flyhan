"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { flightFormSchema } from "./validation";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TypeSeat } from "@prisma/client";

// Generate seat numbers for each class
function generateSeats(flightId: string) {
  const seats: {
    flightId: string;
    seatNumber: string;
    type: TypeSeat;
    isBooked: boolean;
  }[] = [];

  // Economy seats: 20 seats (E1-E20)
  for (let i = 1; i <= 20; i++) {
    seats.push({
      flightId,
      seatNumber: `E${i}`,
      type: TypeSeat.ECONOMY,
      isBooked: false,
    });
  }

  // Business seats: 10 seats (B1-B10)
  for (let i = 1; i <= 10; i++) {
    seats.push({
      flightId,
      seatNumber: `B${i}`,
      type: TypeSeat.BUSINESS,
      isBooked: false,
    });
  }

  // First class seats: 5 seats (F1-F5)
  for (let i = 1; i <= 5; i++) {
    seats.push({
      flightId,
      seatNumber: `F${i}`,
      type: TypeSeat.FIRST,
      isBooked: false,
    });
  }

  return seats;
}

export async function saveFlight(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const values = flightFormSchema.safeParse({
    planeId: formData.get("planeId"),
    price: formData.get("price"),
    departureCity: formData.get("departureCity"),
    departureCityCode: formData.get("departureCityCode"),
    departureDate: formData.get("departureDate"),
    destinationCity: formData.get("destinationCity"),
    destinationCityCode: formData.get("destinationCityCode"),
    arrivalDate: formData.get("arrivalDate"),
  });

  if (!values.success) {
    const errorDesc = values.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return {
      errorTitle: "Error Validation",
      errorDesc,
      successTitle: null,
      successDesc: null,
    };
  }

  // Validate arrival date is after departure date
  if (values.data.arrivalDate <= values.data.departureDate) {
    return {
      errorTitle: "Error Validation",
      errorDesc: "Tanggal tiba harus setelah tanggal keberangkatan",
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    // Create flight
    const flight = await prisma.flight.create({
      data: {
        planeId: values.data.planeId,
        price: values.data.price,
        departureCity: values.data.departureCity,
        departureCityCode: values.data.departureCityCode.toUpperCase(),
        departureDate: values.data.departureDate,
        destinationCity: values.data.destinationCity,
        destinationCityCode: values.data.destinationCityCode.toUpperCase(),
        arrivalDate: values.data.arrivalDate,
      },
    });

    // Create seats for the flight
    const seats = generateSeats(flight.id);
    await prisma.flightSeat.createMany({
      data: seats,
    });
  } catch (error) {
    console.error("Error saving flight:", error);
    return {
      errorTitle: "Gagal Menyimpan Data",
      errorDesc:
        "Terjadi kesalahan saat menyimpan data penerbangan. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }

  redirect("/dashboard/flights");
}

export async function updateFlight(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const values = flightFormSchema.safeParse({
    planeId: formData.get("planeId"),
    price: formData.get("price"),
    departureCity: formData.get("departureCity"),
    departureCityCode: formData.get("departureCityCode"),
    departureDate: formData.get("departureDate"),
    destinationCity: formData.get("destinationCity"),
    destinationCityCode: formData.get("destinationCityCode"),
    arrivalDate: formData.get("arrivalDate"),
  });

  if (!values.success) {
    const errorDesc = values.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return {
      errorTitle: "Error Validation",
      errorDesc,
      successTitle: null,
      successDesc: null,
    };
  }

  // Validate arrival date is after departure date
  if (values.data.arrivalDate <= values.data.departureDate) {
    return {
      errorTitle: "Error Validation",
      errorDesc: "Tanggal tiba harus setelah tanggal keberangkatan",
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    await prisma.flight.update({
      where: { id },
      data: {
        planeId: values.data.planeId,
        price: values.data.price,
        departureCity: values.data.departureCity,
        departureCityCode: values.data.departureCityCode.toUpperCase(),
        departureDate: values.data.departureDate,
        destinationCity: values.data.destinationCity,
        destinationCityCode: values.data.destinationCityCode.toUpperCase(),
        arrivalDate: values.data.arrivalDate,
      },
    });
  } catch (error) {
    console.error("Error updating flight:", error);
    return {
      errorTitle: "Gagal Mengupdate Data",
      errorDesc:
        "Terjadi kesalahan saat mengupdate data penerbangan. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }

  redirect("/dashboard/flights");
}

export async function deleteFlight(id: string): Promise<ActionResult> {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!flight) {
      return {
        errorTitle: "Penerbangan Tidak Ditemukan",
        errorDesc: "Data penerbangan tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Check if there are any tickets for this flight
    if (flight.tickets.length > 0) {
      return {
        errorTitle: "Tidak Dapat Menghapus",
        errorDesc:
          "Penerbangan ini memiliki tiket yang sudah dibooking. Tidak dapat dihapus.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Delete seats first (due to foreign key constraint)
    await prisma.flightSeat.deleteMany({
      where: { flightId: id },
    });

    // Delete flight
    await prisma.flight.delete({
      where: { id },
    });

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: "Data penerbangan berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleting flight:", error);
    return {
      errorTitle: "Gagal Menghapus Data",
      errorDesc:
        "Terjadi kesalahan saat menghapus data penerbangan. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }
}
