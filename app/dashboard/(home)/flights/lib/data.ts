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
