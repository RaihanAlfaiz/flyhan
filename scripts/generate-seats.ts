import prisma from "../lib/prisma";

async function generateSeatsForFlights() {
  try {
    // Get all flights
    const flights = await prisma.flight.findMany();

    console.log(`Found ${flights.length} flights`);

    for (const flight of flights) {
      // Check if flight already has seats
      const existingSeats = await prisma.flightSeat.count({
        where: { flightId: flight.id },
      });

      if (existingSeats > 0) {
        console.log(
          `Flight ${flight.id} already has ${existingSeats} seats, skipping...`
        );
        continue;
      }

      console.log(`Generating seats for flight ${flight.id}...`);

      // Generate 24 seats (6 rows x 4 columns: A, B, C, D)
      const seatTypes = [
        "ECONOMY",
        "ECONOMY",
        "ECONOMY",
        "BUSINESS",
        "BUSINESS",
        "FIRST",
      ];
      const seats = [];

      for (let row = 1; row <= 6; row++) {
        for (const col of ["A", "B", "C", "D"]) {
          const seatNumber = `${row}${col}`;
          const type = seatTypes[row - 1];
          // Randomly mark some seats as booked
          const isBooked = Math.random() < 0.3; // 30% chance of being booked

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
    console.error("Error generating seats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSeatsForFlights();
