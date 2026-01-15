"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPackageOrders() {
  try {
    const orders = await prisma.packageOrder.findMany({
      include: {
        package: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getPackageOrderById(id: string) {
  try {
    const order = await prisma.packageOrder.findUnique({
      where: { id },
      include: {
        package: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            passport: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED"
) {
  try {
    await prisma.packageOrder.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/package-orders");
    revalidatePath(`/dashboard/package-orders/${id}`);

    return {
      successTitle: "Status Updated",
      successDesc: `Order status has been changed to ${status}`,
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Update Failed",
      errorDesc: "Failed to update order status",
    };
  }
}

export async function deletePackageOrder(id: string) {
  try {
    await prisma.packageOrder.delete({
      where: { id },
    });

    revalidatePath("/dashboard/package-orders");

    return {
      successTitle: "Deleted",
      successDesc: "Order has been deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Delete Failed",
      errorDesc: "Failed to delete order",
    };
  }
}

// Get stats for dashboard
export async function getPackageOrderStats() {
  try {
    const [total, pending, success, cancelled, totalRevenue] =
      await Promise.all([
        prisma.packageOrder.count(),
        prisma.packageOrder.count({ where: { status: "PENDING" } }),
        prisma.packageOrder.count({ where: { status: "SUCCESS" } }),
        prisma.packageOrder.count({ where: { status: "CANCELLED" } }),
        prisma.packageOrder.aggregate({
          where: { status: "SUCCESS" },
          _sum: { totalPrice: true },
        }),
      ]);

    return {
      total,
      pending,
      success,
      cancelled,
      totalRevenue: totalRevenue._sum.totalPrice || BigInt(0),
    };
  } catch (error) {
    console.log(error);
    return {
      total: 0,
      pending: 0,
      success: 0,
      cancelled: 0,
      totalRevenue: BigInt(0),
    };
  }
}
