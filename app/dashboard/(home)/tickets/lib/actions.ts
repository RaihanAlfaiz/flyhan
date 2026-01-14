"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import prisma from "@/lib/prisma";
import { StatusTicket } from "@prisma/client";

export async function updateTicketStatus(
  id: string,
  status: StatusTicket
): Promise<ActionResult> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        errorTitle: "Ticket Tidak Ditemukan",
        errorDesc: "Data tiket tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    await prisma.ticket.update({
      where: { id },
      data: { status },
    });

    // If ticket is cancelled/failed, free up the seat
    if (status === StatusTicket.FAILED) {
      await prisma.flightSeat.update({
        where: { id: ticket.seatId },
        data: { isBooked: false },
      });
    }

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: `Status tiket berhasil diubah menjadi ${status}.`,
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      errorTitle: "Gagal Mengupdate Status",
      errorDesc: "Terjadi kesalahan saat mengupdate status tiket.",
      successTitle: null,
      successDesc: null,
    };
  }
}

export async function deleteTicket(id: string): Promise<ActionResult> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        errorTitle: "Ticket Tidak Ditemukan",
        errorDesc: "Data tiket tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Free up the seat
    await prisma.flightSeat.update({
      where: { id: ticket.seatId },
      data: { isBooked: false },
    });

    // Delete ticket
    await prisma.ticket.delete({
      where: { id },
    });

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: "Tiket berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return {
      errorTitle: "Gagal Menghapus Tiket",
      errorDesc: "Terjadi kesalahan saat menghapus tiket.",
      successTitle: null,
      successDesc: null,
    };
  }
}
