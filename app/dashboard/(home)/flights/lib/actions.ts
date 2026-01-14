"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { flightFormSchema } from "./validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { TypeSeat } from "@prisma/client";

// Generate seats based on configuration
// Generate seats based on visual configuration
function generateSeatsFromConfig(flightId: string, seatConfigString: string) {
  try {
    const config = JSON.parse(seatConfigString);
    return config.map((seat: any) => ({
      flightId,
      seatNumber: seat.seatNumber,
      type: seat.type as TypeSeat,
      isBooked: false,
    }));
  } catch (e) {
    console.error("Failed to parse seat config", e);
    return [];
  }
}

export async function saveFlight(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const values = flightFormSchema.safeParse({
    planeId: formData.get("planeId") ?? "",
    price: formData.get("priceEconomy") ?? 0, // Use economy price as base price fallback
    priceEconomy: formData.get("priceEconomy") ?? 0,
    priceBusiness: formData.get("priceBusiness") ?? 0,
    priceFirst: formData.get("priceFirst") ?? 0,
    seatConfig: formData.get("seatConfig") ?? "[]",
    departureCity: formData.get("departureCity") ?? "",
    departureCityCode: formData.get("departureCityCode") ?? "",
    departureDate: formData.get("departureDate") ?? "",
    destinationCity: formData.get("destinationCity") ?? "",
    destinationCityCode: formData.get("destinationCityCode") ?? "",
    arrivalDate: formData.get("arrivalDate") ?? "",
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
      },
    });

    // Create seats for the flight from visual config
    const seats = generateSeatsFromConfig(flight.id, values.data.seatConfig);

    if (seats.length > 0) {
      await prisma.flightSeat.createMany({
        data: seats,
      });
    }
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

  revalidatePath("/dashboard/flights");
  redirect("/dashboard/flights?success=Data berhasil disimpan");
}

export async function updateFlight(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  // Debug log to trace validation issues
  console.log("Update Flight ID:", id);
  /* 
  Uncomment to debug raw data if needed
  const rawData = Object.fromEntries(formData.entries());
  console.log("Update Flight Input:", rawData); 
  */

  const values = flightFormSchema.safeParse({
    planeId: formData.get("planeId") ?? "",
    price: formData.get("priceEconomy") ?? 0,
    priceEconomy: formData.get("priceEconomy") ?? 0,
    priceBusiness: formData.get("priceBusiness") ?? 0,
    priceFirst: formData.get("priceFirst") ?? 0,
    seatConfig: formData.get("seatConfig") ?? "[]",
    departureCity: formData.get("departureCity") ?? "",
    departureCityCode: formData.get("departureCityCode") ?? "",
    departureDate: formData.get("departureDate") ?? "",
    destinationCity: formData.get("destinationCity") ?? "",
    destinationCityCode: formData.get("destinationCityCode") ?? "",
    arrivalDate: formData.get("arrivalDate") ?? "",
  });

  if (!values.success) {
    const errorDesc = values.error.issues
      .map((issue) => issue.message)
      .join(", ");

    console.log("Validation Error:", errorDesc);

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
        priceEconomy: values.data.priceEconomy,
        priceBusiness: values.data.priceBusiness,
        priceFirst: values.data.priceFirst,
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

  revalidatePath("/dashboard/flights");
  redirect("/dashboard/flights?success=Data berhasil diupdate");
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

export async function updateFlightStatus(
  id: string,
  status: "SCHEDULED" | "DELAYED" | "CANCELLED"
): Promise<ActionResult> {
  try {
    await prisma.flight.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/flights");
    revalidatePath("/my-tickets");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Success",
      successDesc: `Flight status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating flight status:", error);
    return {
      errorTitle: "Failed to Update",
      errorDesc: "An error occurred while updating flight status.",
      successTitle: null,
      successDesc: null,
    };
  }
}
