"use server";

import prisma from "@/lib/prisma";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        passport: true,
        role: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        passport: true,
        role: true,
        tickets: {
          include: {
            flight: {
              include: {
                plane: true,
              },
            },
            seat: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}
