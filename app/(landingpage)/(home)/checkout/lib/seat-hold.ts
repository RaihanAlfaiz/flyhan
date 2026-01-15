"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

const HOLD_DURATION_MINUTES = 10;

export interface HoldResult {
  success: boolean;
  message: string;
  holdUntil?: Date;
}

/**
 * Hold seats for a user during checkout process.
 * Seats are locked for 10 minutes.
 */
export async function holdSeats(
  flightId: string,
  seatIds: string[]
): Promise<HoldResult> {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { success: false, message: "Please login first" };
  }

  const now = new Date();
  const holdUntil = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000);

  try {
    // Check if seats are available (not booked and not held by someone else)
    const seats = await prisma.flightSeat.findMany({
      where: {
        id: { in: seatIds },
        flightId: flightId,
      },
    });

    // Validate each seat
    for (const seat of seats) {
      // Already booked
      if (seat.isBooked) {
        return {
          success: false,
          message: `Seat ${seat.seatNumber} is already booked`,
        };
      }

      // Held by another user (and hold hasn't expired)
      if (
        seat.holdUntil &&
        seat.holdUntil > now &&
        seat.heldByUserId !== user.id
      ) {
        return {
          success: false,
          message: `Seat ${seat.seatNumber} is currently being reserved by another customer`,
        };
      }
    }

    // All seats are available, apply hold
    await prisma.flightSeat.updateMany({
      where: {
        id: { in: seatIds },
        flightId: flightId,
      },
      data: {
        holdUntil: holdUntil,
        heldByUserId: user.id,
      },
    });

    return {
      success: true,
      message: `${seatIds.length} seat(s) reserved for ${HOLD_DURATION_MINUTES} minutes`,
      holdUntil: holdUntil,
    };
  } catch (error) {
    console.error("Error holding seats:", error);
    return { success: false, message: "Failed to reserve seats" };
  }
}

/**
 * Release seats hold (when user cancels or leaves checkout)
 */
export async function releaseSeats(seatIds: string[]): Promise<HoldResult> {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Only release seats that are held by this user
    await prisma.flightSeat.updateMany({
      where: {
        id: { in: seatIds },
        heldByUserId: user.id,
      },
      data: {
        holdUntil: null,
        heldByUserId: null,
      },
    });

    return { success: true, message: "Seats released" };
  } catch (error) {
    console.error("Error releasing seats:", error);
    return { success: false, message: "Failed to release seats" };
  }
}

/**
 * Validate that seats are still held by the current user.
 * Call this before completing checkout.
 */
export async function validateSeatHold(seatIds: string[]): Promise<HoldResult> {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { success: false, message: "Please login first" };
  }

  const now = new Date();

  try {
    const seats = await prisma.flightSeat.findMany({
      where: {
        id: { in: seatIds },
      },
    });

    for (const seat of seats) {
      // Check if seat is still held by this user
      if (seat.heldByUserId !== user.id) {
        return {
          success: false,
          message: `Seat ${seat.seatNumber} is no longer reserved for you`,
        };
      }

      // Check if hold has expired
      if (!seat.holdUntil || seat.holdUntil < now) {
        return {
          success: false,
          message: `Your reservation for seat ${seat.seatNumber} has expired`,
        };
      }
    }

    return { success: true, message: "Reservation is still valid" };
  } catch (error) {
    console.error("Error validating seat hold:", error);
    return { success: false, message: "Failed to validate reservation" };
  }
}

/**
 * Clear hold after successful booking.
 * This is called internally after checkout succeeds.
 */
export async function clearHoldAfterBooking(seatIds: string[]): Promise<void> {
  try {
    await prisma.flightSeat.updateMany({
      where: {
        id: { in: seatIds },
      },
      data: {
        holdUntil: null,
        heldByUserId: null,
        isBooked: true,
      },
    });
  } catch (error) {
    console.error("Error clearing hold after booking:", error);
  }
}
