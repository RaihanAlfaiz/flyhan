"use server";

import prisma from "@/lib/prisma";

// Get unique departure cities from flights
export async function getDepartureCities() {
  try {
    const cities = await prisma.flight.findMany({
      select: {
        departureCity: true,
        departureCityCode: true,
      },
      distinct: ["departureCity"],
    });
    return cities;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get unique destination cities from flights
export async function getDestinationCities() {
  try {
    const cities = await prisma.flight.findMany({
      select: {
        destinationCity: true,
        destinationCityCode: true,
      },
      distinct: ["destinationCity"],
    });
    return cities;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get all unique cities (both departure and destination)
export async function getAllCities() {
  try {
    const departureCities = await prisma.flight.findMany({
      select: {
        departureCity: true,
        departureCityCode: true,
      },
      distinct: ["departureCity"],
    });

    const destinationCities = await prisma.flight.findMany({
      select: {
        destinationCity: true,
        destinationCityCode: true,
      },
      distinct: ["destinationCity"],
    });

    // Combine and deduplicate
    const allCitiesMap = new Map<string, { city: string; code: string }>();

    departureCities.forEach((c) => {
      allCitiesMap.set(c.departureCityCode, {
        city: c.departureCity,
        code: c.departureCityCode,
      });
    });

    destinationCities.forEach((c) => {
      allCitiesMap.set(c.destinationCityCode, {
        city: c.destinationCity,
        code: c.destinationCityCode,
      });
    });

    return Array.from(allCitiesMap.values());
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Search flights with filters
export interface FlightSearchParams {
  departureCode?: string;
  arrivalCode?: string;
  date?: string;
  seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
}

export async function searchFlights(params: FlightSearchParams) {
  try {
    const { departureCode, arrivalCode, date, seatType } = params;

    // Build where clause dynamically
    const whereClause: Record<string, unknown> = {
      // Only show flights that haven't departed yet
      departureDate: {
        gte: new Date(),
      },
      // Exclude cancelled flights
      status: {
        not: "CANCELLED",
      },
    };

    if (departureCode) {
      whereClause.departureCityCode = departureCode;
    }

    if (arrivalCode) {
      whereClause.destinationCityCode = arrivalCode;
    }

    if (date) {
      // Filter by date (same day) but still must be in the future
      const searchDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Only search if date is in the future
      const now = new Date();
      const startDate = searchDate > now ? searchDate : now;

      whereClause.departureDate = {
        gte: startDate,
        lt: nextDay,
      };
    }

    // If seat type filter, we need to filter flights that have available seats of that type
    if (seatType) {
      whereClause.seats = {
        some: {
          type: seatType,
          OR: [{ isBooked: false }, { isBooked: null }],
        },
      };
    }

    const flights = await prisma.flight.findMany({
      where: whereClause,
      include: {
        plane: true,
        seats: {
          where: seatType
            ? {
                type: seatType,
                OR: [{ isBooked: false }, { isBooked: null }],
              }
            : {
                OR: [{ isBooked: false }, { isBooked: null }],
              },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    return flights;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get unique airplanes/airlines for filter
export async function getAirplanes() {
  try {
    const airplanes = await prisma.airplane.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    return airplanes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get flight by ID with all seats
export async function getFlightById(id: string) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id },
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
