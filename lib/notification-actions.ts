"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserNotifications(take = 10) {
  const { user } = await getUser();
  if (!user) return [];

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadCount() {
  const { user } = await getUser();
  if (!user) return 0;

  try {
    return await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });
  } catch (error) {
    return 0;
  }
}

export async function markNotificationRead(id: string) {
  const { user } = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update" };
  }
}

export async function markAllRead() {
  const { user } = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update" };
  }
}
