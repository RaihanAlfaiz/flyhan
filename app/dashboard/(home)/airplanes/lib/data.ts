"use server";

import prisma from "@/lib/prisma";

export async function getAirplanes() {
  try {
    const planes = await prisma.airplane.findMany();
    return planes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getAirplaneById(id: string) {
  try {
    const plane = await prisma.airplane.findUnique({
      where: { id },
    });
    return plane;
  } catch (error) {
    console.log(error);
    return null;
  }
}
