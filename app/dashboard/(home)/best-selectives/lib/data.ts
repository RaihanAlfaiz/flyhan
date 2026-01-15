import prisma from "@/lib/prisma";

export async function getBestSelectives() {
  try {
    const data = await prisma.bestSelective.findMany({
      orderBy: { title: "asc" },
    });
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getBestSelectiveById(id: string) {
  try {
    const data = await prisma.bestSelective.findUnique({ where: { id } });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
