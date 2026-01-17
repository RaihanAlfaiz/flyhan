"use server";

import prisma from "@/lib/prisma";

// Get upcoming flights for counter booking
export async function getUpcomingFlights() {
  try {
    const now = new Date();

    const flights = await prisma.flight.findMany({
      where: {
        departureDate: {
          gte: now, // Only future flights
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        plane: true,
        seats: {
          select: {
            id: true,
            seatNumber: true,
            type: true,
            isBooked: true,
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    // Calculate available seats for each flight
    return flights.map((flight) => ({
      ...flight,
      availableSeats: flight.seats.filter((s) => !s.isBooked).length,
      totalSeats: flight.seats.length,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get flight with available seats for seat selection
export async function getFlightForCounterBooking(flightId: string) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        plane: true,
        seats: {
          orderBy: {
            seatNumber: "asc",
          },
        },
      },
    });

    return flight;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Get recent counter bookings for history
export async function getCounterBookingHistory(limit = 20) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        bookingType: "COUNTER",
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
      orderBy: {
        bookingDate: "desc",
      },
      take: limit,
    });

    return tickets;
  } catch (error) {
    console.log(error);
    return [];
  }
}
