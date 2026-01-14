"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { RefundStatus } from "@prisma/client";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";

export async function updateRefundRequestStatus(
  id: string,
  status: RefundStatus
): Promise<ActionResult> {
  try {
    const request = await prisma.refundRequest.update({
      where: { id },
      data: { status },
      include: {
        ticket: true,
      },
    });

    // If approved refund, we could update ticket status to FAILED (cancelled)
    if (status === "APPROVED" && request.type === "REFUND") {
      await prisma.ticket.update({
        where: { id: request.ticketId },
        data: { status: "FAILED" },
      });

      // Free up the seat
      await prisma.flightSeat.update({
        where: { id: request.ticket.seatId },
        data: { isBooked: false },
      });
    }

    revalidatePath("/dashboard/refund-requests");
    revalidatePath("/my-tickets");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Success",
      successDesc: `Request has been ${status.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Error updating refund request:", error);
    return {
      errorTitle: "Failed",
      errorDesc: "Failed to update request status",
      successTitle: null,
      successDesc: null,
    };
  }
}
