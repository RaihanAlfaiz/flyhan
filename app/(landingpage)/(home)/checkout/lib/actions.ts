"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { getBookingConfirmationTemplate } from "@/lib/email-templates/booking-confirmation";

export async function checkoutTicket(
  flightId: string,
  seatIds: string[],
  totalPrice: number,
  passengerData: { seatId: string; name: string; passport?: string }[],
  promoCodeId?: string,
  // Updated: Now per-passenger addons
  selectedAddons?: { seatId: string; addonId: string; requestDetail?: string }[]
) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized" };
  }

  // 1. Check if flight is still available (not departed, not cancelled)
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    include: { plane: true },
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

  // Calculate price per ticket (total / count) - Includes addon price share
  const pricePerTicket = Math.floor(totalPrice / seatIds.length);

  try {
    // Use longer timeout for complex transactions
    // Create consistent booking date for all tickets in this transaction
    const bookingDate = new Date();

    await prisma.$transaction(
      async (tx) => {
        for (const seatId of seatIds) {
          // Generate random code for EACH ticket
          const code = `TRX-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`;

          const passengerDataRaw = passengerData.find(
            (p) => p.seatId === seatId
          );

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

          const newTicket = await tx.ticket.create({
            data: {
              code,
              flightId,
              customerId: user.id,
              seatId,
              bookingDate, // Use shared booking date
              price: BigInt(pricePerTicket),
              status: "SUCCESS",
              tokenMidtrans: `MID-${Date.now()}-${seatId}`,
              // Relations
              promoCodeId: promoCodeId || null,
              passengerId: newPassengerId,
            },
          });

          // Save Addons - Now filtered per seat
          const addonsForThisSeat =
            selectedAddons?.filter((addon) => addon.seatId === seatId) || [];

          for (const addon of addonsForThisSeat) {
            await tx.ticketAddon.create({
              data: {
                ticketId: newTicket.id,
                flightAddonId: addon.addonId,
                requestDetail: addon.requestDetail || null,
              },
            });
          }

          // Mark seat as booked and clear hold
          await tx.flightSeat.update({
            where: { id: seatId },
            data: {
              isBooked: true,
              holdUntil: null,
              heldByUserId: null,
            },
          });
        }
      },
      {
        maxWait: 10000, // 10 seconds max wait to acquire lock
        timeout: 30000, // 30 seconds timeout for transaction
      }
    );
    // Send Email Notification
    try {
      // Get seat numbers for email
      const bookedSeats = await prisma.flightSeat.findMany({
        where: { id: { in: seatIds } },
      });
      const seatNumbers = bookedSeats.map((s) => s.seatNumber).join(", ");

      const emailHtml = getBookingConfirmationTemplate({
        userName: user.name,
        bookingCode: "MULTI-TIX", // Or use the first ticket code if available
        flightCode: flight.plane.code + " (" + flight.plane.name + ")",
        departureCity: flight.departureCity,
        destinationCity: flight.destinationCity,
        departureDate: new Date(flight.departureDate).toLocaleDateString(),
        seatNumber: seatNumbers,
        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(totalPrice),
      });

      // Send in background so we don't block the response
      sendEmail({
        to: user.email,
        subject: "Flight Booking Confirmed! ✈️ - FlyHan",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }
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
