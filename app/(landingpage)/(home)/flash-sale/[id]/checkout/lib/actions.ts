"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { getBookingConfirmationTemplate } from "@/lib/email-templates/booking-confirmation";

function generateTicketCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "FS-"; // Flash Sale prefix
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function bookFlashSale(
  flashSaleId: string,
  flightId: string,
  seatId: string
) {
  try {
    const { session, user } = await getUser();

    if (!session || !user) {
      return { success: false, error: "Anda harus login terlebih dahulu" };
    }

    // Get flash sale with validation
    const flashSale = await prisma.flashSale.findUnique({
      where: { id: flashSaleId },
      include: {
        flight: {
          include: { plane: true },
        },
      },
    });

    if (!flashSale) {
      return { success: false, error: "Flash sale tidak ditemukan" };
    }

    // Validate flash sale is still active
    const now = new Date();
    if (!flashSale.isActive) {
      return { success: false, error: "Flash sale tidak aktif" };
    }
    if (new Date(flashSale.endDate) < now) {
      return { success: false, error: "Flash sale sudah berakhir" };
    }
    if (new Date(flashSale.startDate) > now) {
      return { success: false, error: "Flash sale belum dimulai" };
    }
    if (flashSale.soldCount >= flashSale.maxQuota) {
      return { success: false, error: "Kuota flash sale sudah habis" };
    }

    // Check if seat is still available
    const seat = await prisma.flightSeat.findUnique({
      where: { id: seatId },
    });

    if (!seat || seat.isBooked) {
      return { success: false, error: "Kursi sudah tidak tersedia" };
    }

    // Calculate discounted price
    const originalPrice = flashSale.flight.price;
    const discountedPrice = Math.floor(
      originalPrice * (1 - flashSale.discountPercent / 100)
    );

    // Create ticket and update flash sale in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ticket
      const ticket = await tx.ticket.create({
        data: {
          code: generateTicketCode(),
          flightId: flightId,
          customerId: user.id,
          seatId: seatId,
          bookingDate: new Date(),
          price: BigInt(discountedPrice),
          status: "SUCCESS", // For flash sale, direct success (simplified)
          tokenMidtrans: `FLASH-${Date.now()}`,
        },
      });

      // Mark seat as booked
      await tx.flightSeat.update({
        where: { id: seatId },
        data: { isBooked: true },
      });

      // Increment flash sale sold count
      await tx.flashSale.update({
        where: { id: flashSaleId },
        data: { soldCount: { increment: 1 } },
      });

      return ticket;
    });

    // Send Email Notification
    try {
      const emailHtml = getBookingConfirmationTemplate({
        userName: user.name,
        bookingCode: result.code,
        flightCode:
          flashSale.flight.plane.code +
          " (" +
          flashSale.flight.plane.name +
          ")",
        departureCity: flashSale.flight.departureCity,
        destinationCity: flashSale.flight.destinationCity,
        departureDate: new Date(
          flashSale.flight.departureDate
        ).toLocaleDateString(),
        seatNumber: seat.seatNumber,
        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(discountedPrice),
      });

      // Send in background
      sendEmail({
        to: user.email,
        subject: "Flash Sale Booking Confirmed! ⚡ - FlyHan",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/flash-sale/${flashSaleId}`);
    revalidatePath("/my-tickets");

    return {
      success: true,
      ticketId: result.id,
      ticketCode: result.code,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses booking",
    };
  }
}
