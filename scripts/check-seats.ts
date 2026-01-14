import prisma from "../lib/prisma";

async function checkSeats() {
  try {
    const flight = await prisma.flight.findFirst({
      include: {
        seats: true,
      },
    });

    if (!flight) {
      console.log("No flight found");
      return;
    }

    console.log("Flight ID:", flight.id);
    console.log("Total Seats:", flight.seats.length);
    if (flight.seats.length > 0) {
      console.log("Sample Seats:", flight.seats.slice(0, 5));
    }

    // Check distribution
    const distribution = flight.seats.reduce((acc: any, seat) => {
      acc[seat.type] = (acc[seat.type] || 0) + 1;
      return acc;
    }, {});
    console.log("Seat Type Distribution:", distribution);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeats();
