"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type VerifyResult = {
  success: boolean;
  message: string;
  data?: {
    ticketCode: string;
    passengerName: string;
    flightCode: string;
    seatNumber: string;
    status: string;
  };
};

export async function verifyTicketCheckIn(
  ticketCode: string
): Promise<VerifyResult> {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { code: ticketCode },
      include: {
        flight: {
          include: { plane: true },
        },
        seat: true,
        passenger: true,
        customer: true,
      },
    });

    if (!ticket) {
      return { success: false, message: "Tiket tidak ditemukan!" };
    }

    // Get passenger name - handle counter bookings where customer may be null
    const passengerName =
      ticket.passenger?.name ||
      ticket.customer?.name ||
      ticket.counterCustomerName ||
      "Walk-in Customer";
    const flightInfo = `${ticket.flight.plane.code} - ${ticket.flight.plane.name}`;

    // 1. Check if already boarded
    if (ticket.isBoarded) {
      return {
        success: false,
        message: `PERINGATAN: Tiket INI SUDAH DIGUNAKAN! Check-in pada ${
          ticket.boardedAt ? new Date(ticket.boardedAt).toLocaleString() : "-"
        }`,
        data: {
          ticketCode: ticket.code,
          passengerName,
          flightCode: flightInfo,
          seatNumber: ticket.seat.seatNumber,
          status: "ALREADY_BOARDED",
        },
      };
    }

    // 2. Check if refunded/failed
    if (ticket.status === "FAILED" || ticket.status === "PENDING") {
      return {
        success: false,
        message: `Tiket status tidak valid: ${ticket.status}`,
      };
    }

    // 3. Mark as Boarded
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isBoarded: true,
        boardedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Check-in Berhasil! Silakan masuk.",
      data: {
        ticketCode: ticket.code,
        passengerName,
        flightCode: flightInfo,
        seatNumber: ticket.seat.seatNumber,
        status: "SUCCESS",
      },
    };
  } catch (error) {
    console.error("Scan error:", error);
    return { success: false, message: "Terjadi kesalahan server saat scan." };
  }
}
