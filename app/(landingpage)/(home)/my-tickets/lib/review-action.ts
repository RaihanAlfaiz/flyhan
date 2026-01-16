"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(
  ticketId: string,
  rating: number,
  comment: string
) {
  const { user } = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        flight: true,
      },
    });

    if (!ticket) return { error: "Ticket not found" };
    if (ticket.customerId !== user.id) return { error: "Unauthorized" };

    // Check flight completion (optional but recommended)
    if (new Date(ticket.flight.arrivalDate) > new Date()) {
      return { error: "Cannot review before flight arrival" };
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { ticketId },
    });
    if (existing) return { error: "Already reviewed" };

    await prisma.review.create({
      data: {
        userId: user.id,
        ticketId,
        rating,
        comment,
        airplaneId: ticket.flight.planeId,
      },
    });

    revalidatePath("/my-tickets");
    return { success: true };
  } catch (error) {
    console.error("Review submission error:", error);
    return { error: "Failed to submit review" };
  }
}
