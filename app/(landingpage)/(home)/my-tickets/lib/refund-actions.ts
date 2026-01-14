"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { RefundType } from "@prisma/client";

export async function submitRefundRequest(
  ticketId: string,
  type: RefundType,
  reason: string
) {
  const { user } = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify ticket belongs to user
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { flight: true },
  });

  if (!ticket || ticket.customerId !== user.id) {
    return { error: "Ticket not found" };
  }

  // Check if there's already a pending request
  const existingRequest = await prisma.refundRequest.findFirst({
    where: {
      ticketId,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    return { error: "You already have a pending request for this ticket" };
  }

  try {
    await prisma.refundRequest.create({
      data: {
        ticketId,
        type,
        reason,
      },
    });

    revalidatePath("/my-tickets");
    return { success: true, message: `${type} request submitted successfully` };
  } catch (error) {
    console.error("Error submitting refund request:", error);
    return { error: "Failed to submit request" };
  }
}

export async function getRefundRequestsByTicket(ticketId: string) {
  return prisma.refundRequest.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
  });
}
