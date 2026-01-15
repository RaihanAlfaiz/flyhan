import prisma from "@/lib/prisma";

export async function getFlightAddons() {
  try {
    const addons = await prisma.flightAddon.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return addons;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getFlightAddonById(id: string) {
  try {
    const addon = await prisma.flightAddon.findUnique({
      where: {
        id,
      },
    });
    return addon;
  } catch (error) {
    console.log(error);
    return null;
  }
}
