"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSetting } from "@/app/dashboard/(home)/settings/lib/actions";
import { getBookingConfirmationTemplate } from "@/lib/email-templates/booking-confirmation";
import { getRoundTripBookingConfirmationTemplate } from "@/lib/email-templates/booking-confirmation-round-trip";
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
  departureSeatIds: string; // comma separated
  returnSeatIds: string; // comma separated
  seatType: "ECONOMY" | "BUSINESS" | "FIRST";
  totalPrice: number;
  passengers: Array<{
    departureSeatId: string;
    returnSeatId: string;
    name: string;
    passport?: string;
    title?: string;
    nationality?: string;
  }>;
  addons?: Array<{
    seatId: string;
    addonId: string;
    requestDetail?: string;
  }>;
}) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized" };
  }

  const {
    departureFlightId,
    returnFlightId,
    departureSeatIds,
    returnSeatIds,
    seatType,
    totalPrice,
    passengers,
    addons,
  } = data;

  // Get pricing details for accurate recording
  const pricing = await calculateRoundTripPrice(
    departureFlightId,
    returnFlightId,
    seatType
  );

  if ("error" in pricing) {
    return { error: pricing.error || "Pricing error" };
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
  const depSeatIdList = departureSeatIds.split(",");
  const retSeatIdList = returnSeatIds.split(",");

  const allSeatIds = [...depSeatIdList, ...retSeatIdList];

  const seats = await prisma.flightSeat.findMany({
    where: { id: { in: allSeatIds } },
  });

  const bookedSeat = seats.find((s) => s.isBooked);
  if (bookedSeat) {
    return { error: `Seat ${bookedSeat.seatNumber} is already booked` };
  }

  try {
    const bookingCode = `RT-${Date.now()
      .toString(36)
      .toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    await prisma.$transaction(
      async (tx) => {
        for (const p of passengers) {
          const depSeat = seats.find((s) => s.id === p.departureSeatId);
          const retSeat = seats.find((s) => s.id === p.returnSeatId);

          if (!depSeat || !retSeat) continue;

          const passengerName = `${p.title ? p.title + ". " : ""}${p.name}`;

          // Departure Ticket
          const passengerRecordDep = await tx.passenger.create({
            data: {
              name: passengerName,
              passport: p.passport,
            },
          });

          const depTicket = await tx.ticket.create({
            data: {
              code: `FLYHAN-${pricing.departureFlight.plane.code}-${
                depSeat.seatNumber
              }-${Date.now().toString(36).toUpperCase()}`,
              flightId: departureFlightId,
              customerId: user.id,
              seatId: p.departureSeatId,
              bookingDate: new Date(),
              price: BigInt(Math.floor(totalPrice / 2 / passengers.length)),
              status: "SUCCESS",
              tokenMidtrans: `RT-BUNDLE-${bookingCode}`,
              passengerId: passengerRecordDep.id,
            },
          });

          // Save Departure Addons
          const depAddons =
            addons?.filter((a) => a.seatId === p.departureSeatId) || [];
          for (const addon of depAddons) {
            await tx.ticketAddon.create({
              data: {
                ticketId: depTicket.id,
                flightAddonId: addon.addonId,
                requestDetail: addon.requestDetail || null,
              },
            });
          }

          await tx.flightSeat.update({
            where: { id: p.departureSeatId },
            data: { isBooked: true, holdUntil: null, heldByUserId: null },
          });

          // Return Ticket
          const passengerRecordRet = await tx.passenger.create({
            data: {
              name: passengerName,
              passport: p.passport,
            },
          });

          const retTicket = await tx.ticket.create({
            data: {
              code: `FLYHAN-${pricing.returnFlight.plane.code}-${
                retSeat.seatNumber
              }-${Date.now().toString(36).toUpperCase()}-R`,
              flightId: returnFlightId,
              customerId: user.id,
              seatId: p.returnSeatId,
              bookingDate: new Date(),
              price: BigInt(Math.floor(totalPrice / 2 / passengers.length)),
              status: "SUCCESS",
              tokenMidtrans: `RT-BUNDLE-${bookingCode}`,
              passengerId: passengerRecordRet.id,
            },
          });

          // Save Return Addons
          const retAddons =
            addons?.filter((a) => a.seatId === p.returnSeatId) || [];
          for (const addon of retAddons) {
            await tx.ticketAddon.create({
              data: {
                ticketId: retTicket.id,
                flightAddonId: addon.addonId,
                requestDetail: addon.requestDetail || null,
              },
            });
          }

          await tx.flightSeat.update({
            where: { id: p.returnSeatId },
            data: { isBooked: true, holdUntil: null, heldByUserId: null },
          });
        }

        await tx.roundTripBooking.create({
          data: {
            code: bookingCode,
            customerId: user.id,
            departureFlightId,
            departureSeatId: passengers[0].departureSeatId,
            departurePrice: BigInt(pricing.departurePrice),
            returnFlightId,
            returnSeatId: passengers[0].returnSeatId,
            returnPrice: BigInt(pricing.returnPrice),
            subtotal: BigInt(pricing.subtotal),
            discountPercent: pricing.discountPercent,
            discountAmount: BigInt(pricing.discountAmount),
            totalPrice: BigInt(totalPrice),
            status: "SUCCESS",
            tokenMidtrans: `MID-RT-${Date.now()}`,
            passengerName: `${passengers[0].title || ""} ${passengers[0].name}`,
            passengerPassport: passengers[0].passport || null,
            seatType: seatType,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    try {
      // Prepare email data
      const flightDep = pricing.departureFlight;
      const flightRet = pricing.returnFlight;

      const depSeatsDisplay = depSeatIdList
        .map((id) => seats.find((s) => s.id === id)?.seatNumber || "")
        .join(", ");
      const retSeatsDisplay = retSeatIdList
        .map((id) => seats.find((s) => s.id === id)?.seatNumber || "")
        .join(", ");

      const emailHtml = getRoundTripBookingConfirmationTemplate({
        userName: user.name,
        bookingCode: bookingCode,
        departureFlightCode: `${flightDep.plane.code} (${flightDep.plane.name})`,
        departureRoute: `${flightDep.departureCity} (${flightDep.departureCityCode}) → ${flightDep.destinationCity} (${flightDep.destinationCityCode})`,
        departureDate: new Date(flightDep.departureDate).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        departureSeats: depSeatsDisplay,

        returnFlightCode: `${flightRet.plane.code} (${flightRet.plane.name})`,
        returnRoute: `${flightRet.departureCity} (${flightRet.departureCityCode}) → ${flightRet.destinationCity} (${flightRet.destinationCityCode})`,
        returnDate: new Date(flightRet.departureDate).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        returnSeats: retSeatsDisplay,

        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(totalPrice),
      });

      await sendEmail({
        to: user.email,
        subject: `[FlyHan] Round Trip Booking Confirmed! ✈️🔄 - ${bookingCode}`,
        html: emailHtml,
      });
    } catch (e) {
      console.error("Email error:", e);
    }

    revalidatePath("/my-tickets");
    return { success: true, bookingCode };
  } catch (error) {
    console.error("Round trip checkout error:", error);
    return { error: "Failed to process booking " + error };
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
