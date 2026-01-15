"use server";

import prisma from "@/lib/prisma";

export async function getTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        flight: {
          include: {
            plane: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seat: true,
        addons: {
          include: {
            flightAddon: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });
    return tickets;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getTicketById(id: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        flight: {
          include: {
            plane: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            passport: true,
          },
        },
        seat: true,
        addons: {
          include: {
            flightAddon: true,
          },
        },
      },
    });
    return ticket;
  } catch (error) {
    console.log(error);
    return null;
  }
}
