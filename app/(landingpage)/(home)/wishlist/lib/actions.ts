"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSavedFlight(flightId: string) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized" };
  }

  try {
    const existing = await prisma.savedFlight.findUnique({
      where: {
        userId_flightId: {
          userId: user.id,
          flightId,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedFlight.delete({
        where: { id: existing.id },
      });
      revalidatePath("/wishlist");
      return {
        success: true,
        isSaved: false,
        message: "Flight removed from wishlist",
      };
    } else {
      // Save
      // Get current price info
      const flight = await prisma.flight.findUnique({
        where: { id: flightId },
        select: { priceEconomy: true, price: true },
      });

      if (!flight) return { error: "Flight not found" };

      await prisma.savedFlight.create({
        data: {
          userId: user.id,
          flightId,
          priceAtSave: flight.priceEconomy || flight.price,
        },
      });
      revalidatePath("/wishlist");
      return {
        success: true,
        isSaved: true,
        message: "Flight saved to wishlist",
      };
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return { error: "Failed to update wishlist" };
  }
}

export async function getSavedFlights() {
  const { session, user } = await getUser();

  if (!session || !user) {
    return [];
  }

  try {
    const saved = await prisma.savedFlight.findMany({
      where: {
        userId: user.id,
      },
      include: {
        flight: {
          include: {
            plane: true,
            // Include seats to check availability if needed, but risky for bandwidth
            seats: {
              select: { id: true, type: true, isBooked: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to friendly format if needed, or return as is
    return saved;
  } catch (error) {
    console.error("Get saved flights error:", error);
    return [];
  }
}

export async function getUserSavedFlightIds() {
  const { session, user } = await getUser();

  if (!session || !user) {
    return [];
  }

  try {
    const saved = await prisma.savedFlight.findMany({
      where: { userId: user.id },
      select: { flightId: true },
    });
    return saved.map((s) => s.flightId);
  } catch (error) {
    return [];
  }
}
