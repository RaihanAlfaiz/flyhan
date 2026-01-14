import prisma from "@/lib/prisma";

export async function getPromoCodes() {
  try {
    const promoCodes = await prisma.promoCode.findMany({});
    return promoCodes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getPromoCodeById(id: string) {
  try {
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id: id,
      },
    });
    return promoCode;
  } catch (error) {
    console.log(error);
    return null;
  }
}
