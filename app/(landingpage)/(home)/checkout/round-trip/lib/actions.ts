"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSetting } from "@/app/dashboard/(home)/settings/lib/actions";
import { sendEmail } from "@/lib/mail";

// Get round trip discount percentage
export async function getRoundTripDiscount(): Promise<number> {
  const discount = await getSetting("round_trip_discount", "10");
  return parseInt(discount) || 10;
}

// Calculate round trip pricing
export async function calculateRoundTripPrice(
  departureFlightId: string,
  returnFlightId: string,
  seatType: "ECONOMY" | "BUSINESS" | "FIRST"
) {
  const [departureFlight, returnFlight, discountPercent] = await Promise.all([
    prisma.flight.findUnique({
      where: { id: departureFlightId },
      include: { plane: true },
    }),
    prisma.flight.findUnique({
      where: { id: returnFlightId },
      include: { plane: true },
    }),
    getRoundTripDiscount(),
  ]);

  if (!departureFlight || !returnFlight) {
    return { error: "Flight not found" };
  }

  // Get price based on seat type
  const getPriceForSeatType = (flight: typeof departureFlight) => {
    if (!flight) return 0;
    switch (seatType) {
      case "BUSINESS":
        return flight.priceBusiness;
      case "FIRST":
        return flight.priceFirst;
      default:
        return flight.priceEconomy;
    }
  };

  const departurePrice = getPriceForSeatType(departureFlight);
  const returnPrice = getPriceForSeatType(returnFlight);
  const subtotal = departurePrice + returnPrice;
  const discountAmount = Math.floor((subtotal * discountPercent) / 100);
  const totalPrice = subtotal - discountAmount;

  return {
    departureFlight,
    returnFlight,
    departurePrice,
    returnPrice,
    subtotal,
    discountPercent,
    discountAmount,
    totalPrice,
  };
}

// Checkout round trip booking
export async function checkoutRoundTrip(data: {
  departureFlightId: string;
  returnFlightId: string;
  departureSeatId: string;
  returnSeatId: string;
  seatType: "ECONOMY" | "BUSINESS" | "FIRST";
  passengerName?: string;
  passengerPassport?: string;
}) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized" };
  }

  const {
    departureFlightId,
    returnFlightId,
    departureSeatId,
    returnSeatId,
    seatType,
    passengerName,
    passengerPassport,
  } = data;

  // Get pricing
  const pricing = await calculateRoundTripPrice(
    departureFlightId,
    returnFlightId,
    seatType
  );

  if ("error" in pricing) {
    return { error: pricing.error };
  }

  // Validate flights
  const now = new Date();
  if (new Date(pricing.departureFlight.departureDate) < now) {
    return { error: "Departure flight has already departed" };
  }
  if (new Date(pricing.returnFlight.departureDate) < now) {
    return { error: "Return flight has already departed" };
  }

  // Check seats availability
  const [departureSeat, returnSeat] = await Promise.all([
    prisma.flightSeat.findUnique({ where: { id: departureSeatId } }),
    prisma.flightSeat.findUnique({ where: { id: returnSeatId } }),
  ]);

  if (!departureSeat || departureSeat.isBooked) {
    return { error: "Departure seat is not available" };
  }
  if (!returnSeat || returnSeat.isBooked) {
    return { error: "Return seat is not available" };
  }

  try {
    // Generate booking code
    const bookingCode = `RT-${Date.now()
      .toString(36)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // Create round trip booking
    await prisma.$transaction(async (tx) => {
      // Create round trip booking record
      await tx.roundTripBooking.create({
        data: {
          code: bookingCode,
          customerId: user.id,
          departureFlightId,
          departureSeatId,
          departurePrice: BigInt(pricing.departurePrice),
          returnFlightId,
          returnSeatId,
          returnPrice: BigInt(pricing.returnPrice),
          subtotal: BigInt(pricing.subtotal),
          discountPercent: pricing.discountPercent,
          discountAmount: BigInt(pricing.discountAmount),
          totalPrice: BigInt(pricing.totalPrice),
          status: "SUCCESS",
          tokenMidtrans: `MID-RT-${Date.now()}`,
          passengerName: passengerName || user.name,
          passengerPassport: passengerPassport || null,
          seatType: seatType,
        },
      });

      // Mark departure seat as booked
      await tx.flightSeat.update({
        where: { id: departureSeatId },
        data: {
          isBooked: true,
          holdUntil: null,
          heldByUserId: null,
        },
      });

      // Mark return seat as booked
      await tx.flightSeat.update({
        where: { id: returnSeatId },
        data: {
          isBooked: true,
          holdUntil: null,
          heldByUserId: null,
        },
      });
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: `[FlyHan] Round Trip Booking Confirmed! ✈️🔄 - ${bookingCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4C1D95, #7C3AED); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Round Trip Booking Confirmed! 🎉</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Halo <strong>${user.name}</strong>,</p>
              <p>Terima kasih! Pemesanan round trip Anda telah dikonfirmasi.</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4C1D95;">✈️ Penerbangan Pergi</h3>
                <p><strong>${pricing.departureFlight.plane.name}</strong></p>
                <p>${pricing.departureFlight.departureCity} → ${
          pricing.departureFlight.destinationCity
        }</p>
                <p>${new Date(
                  pricing.departureFlight.departureDate
                ).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
                <p>Kursi: <strong>${
                  departureSeat.seatNumber
                }</strong> (${seatType})</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #22C55E;">🔄 Penerbangan Pulang</h3>
                <p><strong>${pricing.returnFlight.plane.name}</strong></p>
                <p>${pricing.returnFlight.departureCity} → ${
          pricing.returnFlight.destinationCity
        }</p>
                <p>${new Date(
                  pricing.returnFlight.departureDate
                ).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
                <p>Kursi: <strong>${
                  returnSeat.seatNumber
                }</strong> (${seatType})</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #4C1D95, #7C3AED); padding: 20px; border-radius: 10px; color: white;">
                <h3 style="margin-top: 0;">💰 Rincian Pembayaran</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Penerbangan Pergi:</span>
                  <span>Rp ${pricing.departurePrice.toLocaleString(
                    "id-ID"
                  )}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Penerbangan Pulang:</span>
                  <span>Rp ${pricing.returnPrice.toLocaleString("id-ID")}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #86EFAC;">
                  <span>Diskon Round Trip (${pricing.discountPercent}%):</span>
                  <span>-Rp ${pricing.discountAmount.toLocaleString(
                    "id-ID"
                  )}</span>
                </div>
                <hr style="border-color: rgba(255,255,255,0.3); margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                  <span>TOTAL:</span>
                  <span>Rp ${pricing.totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <p style="text-align: center; margin-top: 30px; color: #6b7280;">
                Kode Booking: <strong style="color: #4C1D95;">${bookingCode}</strong>
              </p>
              
              <p>Terima kasih telah memilih FlyHan!</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    revalidatePath("/my-tickets");
    return { success: true, bookingCode };
  } catch (error) {
    console.error("Round trip checkout error:", error);
    return { error: "Failed to process booking" };
  }
}

// Get user's round trip bookings
export async function getUserRoundTripBookings() {
  const { session, user } = await getUser();

  if (!session || !user) {
    return [];
  }

  const bookings = await prisma.roundTripBooking.findMany({
    where: { customerId: user.id },
    orderBy: { bookingDate: "desc" },
  });

  // Enrich with flight data
  const enrichedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const [departureFlight, returnFlight, departureSeat, returnSeat] =
        await Promise.all([
          prisma.flight.findUnique({
            where: { id: booking.departureFlightId },
            include: { plane: true },
          }),
          prisma.flight.findUnique({
            where: { id: booking.returnFlightId },
            include: { plane: true },
          }),
          prisma.flightSeat.findUnique({
            where: { id: booking.departureSeatId },
          }),
          prisma.flightSeat.findUnique({ where: { id: booking.returnSeatId } }),
        ]);

      return {
        ...booking,
        departureFlight,
        returnFlight,
        departureSeat,
        returnSeat,
      };
    })
  );

  return enrichedBookings;
}
