"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { RefundStatus } from "@prisma/client";
import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { calculateRefund } from "./refund-calculator";
import { sendEmail } from "@/lib/mail";

// Approve Refund Request
export async function approveRefundRequest(
  id: string,
  refundAmount: number,
  adminNotes?: string
): Promise<ActionResult> {
  try {
    const request = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            flight: true,
            seat: true,
            customer: true,
          },
        },
      },
    });

    if (!request) {
      return {
        errorTitle: "Not Found",
        errorDesc: "Refund request not found",
        successTitle: null,
        successDesc: null,
      };
    }

    // Calculate original ticket price
    const originalAmount = Number(request.ticket.price);
    const calculation = calculateRefund(
      originalAmount,
      request.ticket.flight.departureDate
    );

    // Update refund request
    await prisma.refundRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        originalAmount: originalAmount,
        refundAmount: refundAmount,
        refundPercent: calculation.refundPercent,
        adminNotes: adminNotes,
        processedAt: new Date(),
      },
    });

    // Update ticket status to FAILED (cancelled)
    await prisma.ticket.update({
      where: { id: request.ticketId },
      data: { status: "FAILED" },
    });

    // Free up the seat
    await prisma.flightSeat.update({
      where: { id: request.ticket.seatId },
      data: { isBooked: false },
    });

    // Send email notification to customer
    if (request.ticket.customer?.email) {
      await sendEmail({
        to: request.ticket.customer.email,
        subject: `[FlyHan] Refund Anda Telah Disetujui - ${request.ticket.code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4C1D95, #7C3AED); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Refund Disetujui ✅</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Halo <strong>${request.ticket.customer.name}</strong>,</p>
              <p>Permohonan refund Anda telah <strong style="color: green;">DISETUJUI</strong>.</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Detail Refund</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Kode Tiket</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${
                      request.ticket.code
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Harga Asli</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rp ${originalAmount.toLocaleString(
                      "id-ID"
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Persentase Refund</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${
                      calculation.refundPercent
                    }%</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: green;">Jumlah Refund</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: green; font-size: 18px;">Rp ${refundAmount.toLocaleString(
                      "id-ID"
                    )}</td>
                  </tr>
                </table>
              </div>
              
              ${
                adminNotes
                  ? `<p><strong>Catatan Admin:</strong> ${adminNotes}</p>`
                  : ""
              }
              
              <p style="color: #6b7280; font-size: 14px;">
                Dana akan dikembalikan ke metode pembayaran Anda dalam 3-7 hari kerja.
              </p>
              
              <p>Terima kasih telah menggunakan FlyHan!</p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    revalidatePath("/dashboard/refund-requests");
    revalidatePath("/my-tickets");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Refund Approved",
      successDesc: `Refund Rp ${refundAmount.toLocaleString(
        "id-ID"
      )} telah disetujui`,
    };
  } catch (error) {
    console.error("Error approving refund:", error);
    return {
      errorTitle: "Failed",
      errorDesc: "Failed to approve refund request",
      successTitle: null,
      successDesc: null,
    };
  }
}

// Approve Reschedule Request
export async function approveRescheduleRequest(
  id: string,
  newFlightId: string,
  newSeatId: string,
  adminNotes?: string
): Promise<ActionResult> {
  try {
    const request = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            flight: true,
            seat: true,
            customer: true,
          },
        },
      },
    });

    if (!request) {
      return {
        errorTitle: "Not Found",
        errorDesc: "Reschedule request not found",
        successTitle: null,
        successDesc: null,
      };
    }

    // Get new flight and seat
    const newFlight = await prisma.flight.findUnique({
      where: { id: newFlightId },
      include: { plane: true },
    });
    const newSeat = await prisma.flightSeat.findUnique({
      where: { id: newSeatId },
    });

    if (!newFlight || !newSeat) {
      return {
        errorTitle: "Invalid Selection",
        errorDesc: "Flight or seat not found",
        successTitle: null,
        successDesc: null,
      };
    }

    if (newSeat.isBooked) {
      return {
        errorTitle: "Seat Unavailable",
        errorDesc: "Selected seat is already booked",
        successTitle: null,
        successDesc: null,
      };
    }

    // Update refund request
    await prisma.refundRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        newFlightId: newFlightId,
        newSeatId: newSeatId,
        adminNotes: adminNotes,
        processedAt: new Date(),
      },
    });

    // Free up old seat
    await prisma.flightSeat.update({
      where: { id: request.ticket.seatId },
      data: { isBooked: false },
    });

    // Book new seat
    await prisma.flightSeat.update({
      where: { id: newSeatId },
      data: { isBooked: true },
    });

    // Update ticket with new flight and seat
    await prisma.ticket.update({
      where: { id: request.ticketId },
      data: {
        flightId: newFlightId,
        seatId: newSeatId,
      },
    });

    // Send email notification
    if (request.ticket.customer?.email) {
      await sendEmail({
        to: request.ticket.customer.email,
        subject: `[FlyHan] Jadwal Penerbangan Anda Diubah - ${request.ticket.code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4C1D95, #7C3AED); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Reschedule Disetujui 🔄</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Halo <strong>${request.ticket.customer.name}</strong>,</p>
              <p>Permohonan reschedule Anda telah <strong style="color: green;">DISETUJUI</strong>.</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Jadwal Baru</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Kode Tiket</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${
                      request.ticket.code
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Penerbangan Baru</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${
                      newFlight.plane.code
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Tanggal</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${new Date(
                      newFlight.departureDate
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #4C1D95;">Kursi Baru</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #4C1D95; font-size: 18px;">${
                      newSeat.seatNumber
                    }</td>
                  </tr>
                </table>
              </div>
              
              ${
                adminNotes
                  ? `<p><strong>Catatan Admin:</strong> ${adminNotes}</p>`
                  : ""
              }
              
              <p>Terima kasih telah menggunakan FlyHan!</p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    revalidatePath("/dashboard/refund-requests");
    revalidatePath("/my-tickets");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Reschedule Approved",
      successDesc: `Tiket berhasil dipindahkan ke penerbangan baru`,
    };
  } catch (error) {
    console.error("Error approving reschedule:", error);
    return {
      errorTitle: "Failed",
      errorDesc: "Failed to approve reschedule request",
      successTitle: null,
      successDesc: null,
    };
  }
}

// Reject Request (Refund or Reschedule)
export async function rejectRequest(
  id: string,
  adminNotes: string
): Promise<ActionResult> {
  try {
    const request = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!request) {
      return {
        errorTitle: "Not Found",
        errorDesc: "Request not found",
        successTitle: null,
        successDesc: null,
      };
    }

    await prisma.refundRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNotes: adminNotes,
        processedAt: new Date(),
      },
    });

    // Send email notification
    if (request.ticket.customer?.email) {
      await sendEmail({
        to: request.ticket.customer.email,
        subject: `[FlyHan] Permohonan ${
          request.type === "REFUND" ? "Refund" : "Reschedule"
        } Ditolak - ${request.ticket.code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #DC2626, #EF4444); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Permohonan Ditolak ❌</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p>Halo <strong>${request.ticket.customer.name}</strong>,</p>
              <p>Mohon maaf, permohonan ${
                request.type === "REFUND" ? "refund" : "reschedule"
              } Anda untuk tiket <strong>${
          request.ticket.code
        }</strong> telah <strong style="color: red;">DITOLAK</strong>.</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Alasan Penolakan</h3>
                <p style="color: #374151;">${adminNotes}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Jika Anda memiliki pertanyaan, silakan hubungi customer service kami.
              </p>
              
              <p>Terima kasih atas pengertiannya.</p>
            </div>
          </div>
        `,
      }).catch(console.error);
    }

    revalidatePath("/dashboard/refund-requests");
    revalidatePath("/my-tickets");

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Request Rejected",
      successDesc: "Permohonan telah ditolak",
    };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      errorTitle: "Failed",
      errorDesc: "Failed to reject request",
      successTitle: null,
      successDesc: null,
    };
  }
}

// Get available flights for reschedule
export async function getAvailableFlightsForReschedule(
  currentFlightId: string
) {
  const currentFlight = await prisma.flight.findUnique({
    where: { id: currentFlightId },
  });

  if (!currentFlight) return [];

  // Get flights with same origin/destination that haven't departed
  const flights = await prisma.flight.findMany({
    where: {
      departureCity: currentFlight.departureCity,
      destinationCity: currentFlight.destinationCity,
      departureDate: { gt: new Date() },
      status: "SCHEDULED",
    },
    include: {
      plane: true,
      seats: {
        where: { isBooked: false },
      },
    },
    orderBy: { departureDate: "asc" },
    take: 10,
  });

  return flights;
}

// Legacy function for backward compatibility
export async function updateRefundRequestStatus(
  id: string,
  status: RefundStatus
): Promise<ActionResult> {
  if (status === "APPROVED") {
    return {
      errorTitle: "Use Specific Action",
      errorDesc: "Please use approveRefundRequest or approveRescheduleRequest",
      successTitle: null,
      successDesc: null,
    };
  }

  if (status === "REJECTED") {
    return rejectRequest(id, "Ditolak oleh admin");
  }

  return {
    errorTitle: "Invalid Status",
    errorDesc: "Invalid status update",
    successTitle: null,
    successDesc: null,
  };
}
