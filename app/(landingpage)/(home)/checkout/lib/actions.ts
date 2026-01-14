"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkoutTicket(
  flightId: string,
  seatIds: string[],
  totalPrice: number,
  passengerData: { seatId: string; name: string; passport?: string }[],
  promoCodeId?: string
) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized" };
  }

  // 1. Check if flight is still available (not departed, not cancelled)
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
  });

  if (!flight) {
    return { error: "Flight not found" };
  }

  // Check if flight has already departed
  if (new Date(flight.departureDate) < new Date()) {
    return { error: "This flight has already departed" };
  }

  // Check if flight is cancelled
  if ((flight as any).status === "CANCELLED") {
    return { error: "This flight has been cancelled" };
  }

  // 2. Check if all seats are still available
  const seats = await prisma.flightSeat.findMany({
    where: {
      id: { in: seatIds },
    },
  });

  const allAvailable = seats.every((seat) => !seat.isBooked);

  if (!allAvailable || seats.length !== seatIds.length) {
    return { error: "One or more seats are already booked" };
  }

  // Calculate price per ticket (distribute total evenly for simplicity, or we could pass individual prices)
  // Since we pass total price for all tickets in previous step, let's just stick with total here for the sake of MVP
  // But strictly speaking, Ticket model has 'price' field. Ideally we should save individual price.
  // For now, let's divide total by count to save per-ticket price.
  const pricePerTicket = Math.floor(totalPrice / seatIds.length);

  try {
    await prisma.$transaction(async (tx) => {
      for (const seatId of seatIds) {
        // Generate random code for EACH ticket
        const code = `TRX-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;

        const passengerDataRaw = passengerData.find((p) => p.seatId === seatId);

        let newPassengerId = null;
        if (passengerDataRaw) {
          const newPassenger = await tx.passenger.create({
            data: {
              name: passengerDataRaw.name,
              passport: passengerDataRaw.passport,
            },
          });
          newPassengerId = newPassenger.id;
        }

        await tx.ticket.create({
          data: {
            code,
            flightId,
            customerId: user.id,
            seatId,
            bookingDate: new Date(),
            price: BigInt(pricePerTicket),
            status: "SUCCESS",
            tokenMidtrans: `MID-${Date.now()}-${seatId}`,
            // Relations
            promoCodeId: promoCodeId || null,
            passengerId: newPassengerId,
          },
        });

        await tx.flightSeat.update({
          where: { id: seatId },
          data: { isBooked: true },
        });
      }
    });
  } catch (error) {
    console.error("Checkout validation error:", error);
    return { error: "Failed to process transaction" };
  }

  revalidatePath("/my-tickets");
  return { success: true };
}

export async function verifyPromoCode(code: string) {
  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return { error: "Invalid promo code" };
  }

  // Check if active
  if (!promo.isActive) {
    return { error: "Promo code is inactive" };
  }

  // Check expiration
  if (promo.validUntil && new Date() > new Date(promo.validUntil)) {
    return { error: "Promo code has expired" };
  }

  return {
    id: promo.id,
    success: true,
    discount: promo.discount,
  };
}
