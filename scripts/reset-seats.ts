import prisma from "../lib/prisma";

async function resetSeats() {
  try {
    console.log("Deleting existing seats...");
    await prisma.flightSeat.deleteMany({});
    console.log("Seats deleted.");

    // Get all flights
    const flights = await prisma.flight.findMany();
    console.log(`Found ${flights.length} flights`);

    for (const flight of flights) {
      console.log(`Generating user-friendly seats for flight ${flight.id}...`);

      // Generate 24 seats (6 rows x 4 columns: A, B, C, D)
      // Rows 1-3: Economy, 4-5: Business, 6: First
      const seats = [];

      for (let row = 1; row <= 6; row++) {
        let type;
        if (row <= 3) type = "ECONOMY";
        else if (row <= 5) type = "BUSINESS";
        else type = "FIRST";

        for (const col of ["A", "B", "C", "D"]) {
          const seatNumber = `${row}${col}`;

          // Randomly mark some seats as booked
          const isBooked = Math.random() < 0.3;

          seats.push({
            flightId: flight.id,
            seatNumber,
            type: type as "ECONOMY" | "BUSINESS" | "FIRST",
            isBooked,
          });
        }
      }

      // Create seats in database
      await prisma.flightSeat.createMany({
        data: seats,
      });

      console.log(`Created ${seats.length} seats for flight ${flight.id}`);
    }

    console.log("Done!");
  } catch (error) {
    console.error("Error resetting seats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSeats();
