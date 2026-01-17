"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Generate ticket code
function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "CTR-"; // Counter booking prefix
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface PassengerInput {
  seatId: string;
  name: string;
  passport?: string;
}

interface CounterBookingInput {
  flightId: string;
  seatIds: string[];
  passengers: PassengerInput[];
  paymentMethod: "CASH" | "BANK_TRANSFER" | "DEBIT_CARD" | "CREDIT_CARD";
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  totalPrice: number;
}

export async function createCounterBooking(input: CounterBookingInput) {
  try {
    const { user } = await getUser();

    if (!user || user.role !== "ADMIN") {
      return { error: "Unauthorized. Admin access required." };
    }

    const {
      flightId,
      seatIds,
      passengers,
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      totalPrice,
    } = input;

    // Validate flight exists
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        seats: {
          where: {
            id: { in: seatIds },
          },
        },
      },
    });

    if (!flight) {
      return { error: "Flight not found." };
    }

    // Check if all seats are available
    const unavailableSeats = flight.seats.filter((s) => s.isBooked);
    if (unavailableSeats.length > 0) {
      return {
        error: `Seats ${unavailableSeats
          .map((s) => s.seatNumber)
          .join(", ")} are already booked.`,
      };
    }

    // Create tickets for each seat
    const createdTickets = [];

    for (const seatId of seatIds) {
      const passengerData = passengers.find((p) => p.seatId === seatId);
      const seat = flight.seats.find((s) => s.id === seatId);

      if (!passengerData || !seat) continue;

      // Calculate individual seat price
      let seatPrice = flight.price;
      if (seat.type === "BUSINESS") {
        seatPrice = flight.priceBusiness || Math.round(flight.price * 1.5);
      } else if (seat.type === "FIRST") {
        seatPrice = flight.priceFirst || Math.round(flight.price * 2.5);
      } else {
        seatPrice = flight.priceEconomy || flight.price;
      }

      // Create passenger
      const passenger = await prisma.passenger.create({
        data: {
          name: passengerData.name,
          passport: passengerData.passport,
        },
      });

      // Create ticket
      const ticket = await prisma.ticket.create({
        data: {
          code: generateTicketCode(),
          flightId,
          seatId,
          bookingDate: new Date(),
          price: seatPrice,
          status: "SUCCESS", // Counter bookings are immediately successful
          bookingType: "COUNTER",
          paymentMethod,
          bookedById: user.id,
          counterCustomerName: customerName,
          counterCustomerPhone: customerPhone,
          counterCustomerEmail: customerEmail,
          passengerId: passenger.id,
        },
        include: {
          flight: {
            include: {
              plane: true,
            },
          },
          seat: true,
          passenger: true,
        },
      });

      // Mark seat as booked
      await prisma.flightSeat.update({
        where: { id: seatId },
        data: { isBooked: true },
      });

      createdTickets.push(ticket);
    }

    revalidatePath("/dashboard/counter-booking");
    revalidatePath("/dashboard/tickets");

    return {
      success: true,
      tickets: createdTickets,
      message: `Successfully booked ${createdTickets.length} ticket(s)`,
    };
  } catch (error) {
    console.error("Counter booking error:", error);
    return { error: "Failed to create booking. Please try again." };
  }
}

// Cancel counter booking (refund)
export async function cancelCounterBooking(ticketId: string) {
  try {
    const { user } = await getUser();

    if (!user || user.role !== "ADMIN") {
      return { error: "Unauthorized. Admin access required." };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { seat: true },
    });

    if (!ticket) {
      return { error: "Ticket not found." };
    }

    if (ticket.bookingType !== "COUNTER") {
      return { error: "This is not a counter booking." };
    }

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "FAILED" },
    });

    // Release the seat
    await prisma.flightSeat.update({
      where: { id: ticket.seatId },
      data: { isBooked: false },
    });

    revalidatePath("/dashboard/counter-booking");
    revalidatePath("/dashboard/tickets");

    return { success: true, message: "Booking cancelled successfully." };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { error: "Failed to cancel booking." };
  }
}
