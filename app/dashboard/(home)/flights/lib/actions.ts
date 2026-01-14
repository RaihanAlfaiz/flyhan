"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { flightFormSchema } from "./validation";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TypeSeat } from "@prisma/client";

// Generate seats based on configuration
function generateSeats(
  flightId: string,
  config: { economy: number; business: number; first: number }
) {
  const seats: {
    flightId: string;
    seatNumber: string;
    type: TypeSeat;
    isBooked: boolean;
  }[] = [];

  let currentRow = 1;

  const generateClassSeats = (count: number, type: TypeSeat) => {
    for (let i = 0; i < count; i++) {
      const rowOffset = Math.floor(i / 4);
      const colIndex = i % 4;
      const colLabel = ["A", "B", "C", "D"][colIndex];
      const row = currentRow + rowOffset;

      seats.push({
        flightId,
        seatNumber: `${row}${colLabel}`,
        type,
        isBooked: false,
      });
    }
    // Update currentRow for next class
    currentRow += Math.ceil(count / 4);
  };

  if (config.economy > 0) generateClassSeats(config.economy, TypeSeat.ECONOMY);
  if (config.business > 0)
    generateClassSeats(config.business, TypeSeat.BUSINESS);
  if (config.first > 0) generateClassSeats(config.first, TypeSeat.FIRST);

  return seats;
}

export async function saveFlight(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const values = flightFormSchema.safeParse({
    planeId: formData.get("planeId"),
    price: formData.get("priceEconomy"), // Use economy price as base price fallback
    priceEconomy: formData.get("priceEconomy"),
    priceBusiness: formData.get("priceBusiness"),
    priceFirst: formData.get("priceFirst"),
    seatsEconomy: formData.get("seatsEconomy"),
    seatsBusiness: formData.get("seatsBusiness"),
    seatsFirst: formData.get("seatsFirst"),
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
        priceEconomy: values.data.priceEconomy,
        priceBusiness: values.data.priceBusiness,
        priceFirst: values.data.priceFirst,
        departureCity: values.data.departureCity,
        departureCityCode: values.data.departureCityCode.toUpperCase(),
        departureDate: values.data.departureDate,
        destinationCity: values.data.destinationCity,
        destinationCityCode: values.data.destinationCityCode.toUpperCase(),
        arrivalDate: values.data.arrivalDate,
      } as any,
    });

    // Create seats for the flight
    const seats = generateSeats(flight.id, {
      economy: values.data.seatsEconomy,
      business: values.data.seatsBusiness,
      first: values.data.seatsFirst,
    });

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
