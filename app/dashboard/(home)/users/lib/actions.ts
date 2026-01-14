"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import prisma from "@/lib/prisma";
import { RoleUser } from "@prisma/client";

export async function updateUserRole(
  id: string,
  role: RoleUser
): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        errorTitle: "User Tidak Ditemukan",
        errorDesc: "Data user tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: `Role user berhasil diubah menjadi ${role}.`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      errorTitle: "Gagal Mengupdate Role",
      errorDesc: "Terjadi kesalahan saat mengupdate role user.",
      successTitle: null,
      successDesc: null,
    };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tickets: true,
        sessions: true,
      },
    });

    if (!user) {
      return {
        errorTitle: "User Tidak Ditemukan",
        errorDesc: "Data user tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Check if user has tickets
    if (user.tickets.length > 0) {
      return {
        errorTitle: "Tidak Dapat Menghapus",
        errorDesc: "User memiliki tiket. Hapus tiket terlebih dahulu.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Delete sessions first
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: "User berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      errorTitle: "Gagal Menghapus User",
      errorDesc: "Terjadi kesalahan saat menghapus user.",
      successTitle: null,
      successDesc: null,
    };
  }
}
