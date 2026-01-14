import prisma from "../lib/prisma";

async function checkSeatTypes() {
  try {
    const seats = await prisma.flightSeat.findMany({
      take: 5,
      select: {
        type: true,
        seatNumber: true,
      },
    });

    console.log("Sample Seats:", seats);

    // Check distinct types
    const types = await prisma.flightSeat.groupBy({
      by: ["type"],
      _count: true,
    });
    console.log("Seat Types:", types);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeatTypes();
