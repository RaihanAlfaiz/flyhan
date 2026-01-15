"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkoutPackage(
  packageId: string,
  quantity: number,
  notes?: string,
  promoCodeId?: string
) {
  const { session, user } = await getUser();

  if (!session || !user) {
    return { error: "Unauthorized. Silakan login terlebih dahulu." };
  }

  // Get Package
  const pkg = await prisma.flightPackage.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    return { error: "Package tidak ditemukan." };
  }

  // Calculate total price
  const totalPrice = pkg.price * quantity;

  // Generate order code
  const code = `PKG-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  try {
    const order = await prisma.packageOrder.create({
      data: {
        code,
        packageId,
        customerId: user.id,
        quantity,
        totalPrice: BigInt(totalPrice),
        status: "SUCCESS", // For now, direct success (no payment gateway yet)
        tokenMidtrans: `MID-PKG-${Date.now()}`,
        notes,
      },
    });

    revalidatePath("/my-packages");
    return { success: true, orderId: order.id, orderCode: order.code };
  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "Gagal memproses pesanan. Silakan coba lagi." };
  }
}

export async function verifyPromoCode(code: string) {
  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return { error: "Kode promo tidak valid" };
  }

  if (!promo.isActive) {
    return { error: "Kode promo sudah tidak aktif" };
  }

  if (promo.validUntil && new Date() > new Date(promo.validUntil)) {
    return { error: "Kode promo sudah kadaluarsa" };
  }

  return {
    id: promo.id,
    success: true,
    discount: promo.discount,
  };
}
