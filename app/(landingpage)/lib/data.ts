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
