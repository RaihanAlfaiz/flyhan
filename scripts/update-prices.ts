import prisma from "../lib/prisma";

async function updateFlightPrices() {
  try {
    const flights = await prisma.flight.findMany();

    for (const flight of flights) {
      // Set default prices based on existing base price
      const basePrice = flight.price;

      await prisma.flight.update({
        where: { id: flight.id },
        data: {
          priceEconomy: basePrice,
          priceBusiness: Math.round(basePrice * 1.5), // 50% more
          priceFirst: Math.round(basePrice * 2.5), // 150% more
        },
      });

      console.log(`Updated prices for flight ${flight.id}`);
    }

    console.log("Done updating prices!");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFlightPrices();
