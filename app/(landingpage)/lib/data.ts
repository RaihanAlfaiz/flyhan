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
  dateOnOrAfter?: boolean; // If true, show flights on or after the date instead of exact date
  seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  passengerCount?: number;
  // New filter params
  sort?: "price_asc" | "price_desc" | "departure_asc" | "departure_desc";
  time?: "morning" | "afternoon" | "evening" | "night";
  minPrice?: number;
  maxPrice?: number;
  airlines?: string[]; // Array of plane codes
}

export async function searchFlights(params: FlightSearchParams) {
  try {
    const {
      departureCode,
      arrivalCode,
      date,
      dateOnOrAfter = false,
      seatType,
      passengerCount = 1,
      sort,
      time,
      minPrice,
      maxPrice,
      airlines,
    } = params;

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
      const searchDate = new Date(date);
      const now = new Date();
      const startDate = searchDate > now ? searchDate : now;

      if (dateOnOrAfter) {
        // For return flights: show on or after the date
        whereClause.departureDate = {
          gte: startDate,
        };
      } else {
        // For departure flights: show exact date only
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        whereClause.departureDate = {
          gte: startDate,
          lt: nextDay,
        };
      }
    }

    // Filter by airlines (plane codes)
    if (airlines && airlines.length > 0) {
      whereClause.plane = {
        code: {
          in: airlines,
        },
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

    // Price filter (based on seat type)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceField =
        seatType === "BUSINESS"
          ? "priceBusiness"
          : seatType === "FIRST"
          ? "priceFirst"
          : "priceEconomy";

      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined && minPrice > 0) {
        priceFilter.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        priceFilter.lte = maxPrice;
      }
      if (Object.keys(priceFilter).length > 0) {
        whereClause[priceField] = priceFilter;
      }
    }

    // Determine sort order
    let orderBy: Record<string, string> = { departureDate: "asc" };
    if (sort) {
      switch (sort) {
        case "price_asc":
          orderBy = { priceEconomy: "asc" };
          break;
        case "price_desc":
          orderBy = { priceEconomy: "desc" };
          break;
        case "departure_asc":
          orderBy = { departureDate: "asc" };
          break;
        case "departure_desc":
          orderBy = { departureDate: "desc" };
          break;
      }
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
      orderBy,
    });

    // Filter flights that have enough available seats for the passenger count
    let filteredFlights = flights.filter(
      (flight) => flight.seats.length >= passengerCount
    );

    // Filter by departure time
    if (time) {
      filteredFlights = filteredFlights.filter((flight) => {
        const hour = new Date(flight.departureDate).getHours();
        switch (time) {
          case "morning":
            return hour >= 6 && hour < 12;
          case "afternoon":
            return hour >= 12 && hour < 18;
          case "evening":
            return hour >= 18 && hour < 22;
          case "night":
            return hour >= 22 || hour < 6;
          default:
            return true;
        }
      });
    }

    return filteredFlights;
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

// Get Best Selective Data (ALL)
export async function getBestSelectives() {
  try {
    const data = await prisma.bestSelective.findMany({
      orderBy: {
        id: "desc",
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getAllPackages() {
  try {
    const packages = await prisma.flightPackage.findMany({
      orderBy: {
        title: "asc",
      },
    });
    return packages;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getActiveFlashSales() {
  try {
    const now = new Date();
    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        endDate: { gte: now }, // Not expired
      },
      include: {
        flight: {
          include: { plane: true },
        },
      },
      orderBy: { endDate: "asc" }, // Soonest ending first
      take: 6, // Limit to 6 flash sales
    });
    return flashSales;
  } catch (error) {
    console.log(error);
    return [];
  }
}
