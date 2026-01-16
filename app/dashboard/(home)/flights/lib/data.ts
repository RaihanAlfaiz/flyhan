"use server";

import prisma from "@/lib/prisma";

export async function getFlights() {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        plane: true,
        seats: true,
      },
      orderBy: {
        departureDate: "desc",
      },
    });
    return flights;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getFlightById(id: string) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id },
      include: {
        plane: true,
        seats: true,
      },
    });
    return flight;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getAirplanesForSelect() {
  try {
    const planes = await prisma.airplane.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    return planes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Get unique cities from existing flights
export async function getExistingCities() {
  try {
    const flights = await prisma.flight.findMany({
      select: {
        departureCity: true,
        departureCityCode: true,
        destinationCity: true,
        destinationCityCode: true,
      },
    });

    // Combine departure and destination cities, remove duplicates
    const cityMap = new Map<string, string>();

    flights.forEach((flight) => {
      cityMap.set(flight.departureCity, flight.departureCityCode);
      cityMap.set(flight.destinationCity, flight.destinationCityCode);
    });

    const cities = Array.from(cityMap.entries()).map(([name, code]) => ({
      name,
      code,
    }));

    return cities.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.log(error);
    return [];
  }
}
