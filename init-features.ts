import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding new features data...");

  // 1. Seed Best Selective
  const selectives = [
    {
      title: "First Lounge",
      subtitle: "Manhanggattan",
      image: "/assets/images/thumbnail/thumbnail1.png",
    },
    {
      title: "Business First",
      subtitle: "Gulfstream 109-BB",
      image: "/assets/images/thumbnail/thumbnail2.png",
    },
    {
      title: "Pickup at Home",
      subtitle: "Bentley Banta",
      image: "/assets/images/thumbnail/thumbnail3.png",
    },
    {
      title: "Fly Roam",
      subtitle: "Capung A19-22",
      image: "/assets/images/thumbnail/thumbnail4.png",
    },
  ];

  for (const s of selectives) {
    await prisma.bestSelective.create({
      data: s,
    });
  }
  console.log("Best Selective seeded!");

  // 2. Seed Flight Addons (Master Data)
  const addons = [
    {
      code: "PICKUP",
      title: "Pickup at Home",
      description: "Luxury car pickup service from your doorstep.",
      price: 500000,
    },
    {
      code: "LOUNGE",
      title: "First Lounge Plus",
      description: "Access to exclusive premium lounge with buffet.",
      price: 250000,
    },
    {
      code: "FOOD",
      title: "Special Meals",
      description: "Custom dietary meal request (Vegan, Gluten Free, etc).",
      price: 150000,
    },
    {
      code: "BENTLEY",
      title: "Bentley Power",
      description: "Experience the power of Bentley on the runway.",
      price: 1000000,
    },
  ];

  for (const addon of addons) {
    const exists = await prisma.flightAddon.findUnique({
      where: { code: addon.code },
    });
    if (!exists) {
      await prisma.flightAddon.create({ data: addon });
    }
  }
  console.log("Flight Addons seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
