"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPathFromUrl,
} from "@/lib/supabase";
import { z } from "zod";
import { hash, verify } from "@node-rs/bcrypt";
import { type ActionResult } from "@/app/(landingpage)/(auth)/signup/lib/action";

const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  passport: z.string().optional(),
  avatar: z.any().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini harus diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const { user } = await getUser();
  if (!user) {
    return {
      errorTitle: "Unauthorized",
      errorDesc: "Anda harus login untuk mengubah profil",
      successTitle: null,
      successDesc: null,
    };
  }

  const values = profileSchema.safeParse({
    name: formData.get("name"),
    passport: formData.get("passport"),
    avatar: formData.get("avatar"),
  });

  if (!values.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: values.error.errors.map((e) => e.message).join(", "),
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    let avatarUrl = user.avatar; // Keep old avatar default

    const avatarFile = formData.get("avatar") as File;

    // Handle Avatar Upload
    if (avatarFile && avatarFile.size > 0) {
      // 1. Delete old avatar if exists (and different from default placeholders if any)
      if (user.avatar) {
        const oldPath = getPathFromUrl(user.avatar);
        if (oldPath) await deleteFile(oldPath).catch(() => {});
      }

      // 2. Upload new
      const uploaded = await uploadFile(avatarFile, "avatars"); // Assuming 'avatars' folder or root
      avatarUrl = getPublicUrl(uploaded.path);
    }

    // Update DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: values.data.name,
        passport: values.data.passport,
        ...(avatarUrl && { avatar: avatarUrl }), // Only update if url exists
      },
    });

    revalidatePath("/profile/settings");
    revalidatePath("/dashboard"); // If user is admin

    return {
      successTitle: "Berhasil",
      successDesc: "Profil berhasil diperbarui",
      errorTitle: null,
      errorDesc: null,
    };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return {
      errorTitle: "Gagal Update Profile",
      errorDesc: "Terjadi kesalahan server",
      successTitle: null,
      successDesc: null,
    };
  }
}

export async function changePassword(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const { user } = await getUser();
  if (!user) {
    return {
      errorTitle: "Unauthorized",
      errorDesc: "Anda harus login",
      successTitle: null,
      successDesc: null,
    };
  }

  const values = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!values.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: values.error.errors.map((e) => e.message).join(", "),
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    // 1. Verify Current Password
    // Kita harus fetch password hash dari DB karena 'user' dari session mungkin tidak punya field password atau password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) throw new Error("User not found");

    const validPassword = await verify(
      values.data.currentPassword,
      dbUser.password
    );

    if (!validPassword) {
      return {
        errorTitle: "Password Salah",
        errorDesc: "Password saat ini yang Anda masukkan salah.",
        successTitle: null,
        successDesc: null,
      };
    }

    // 2. Hash New Password
    const hashedPassword = await hash(values.data.newPassword, 10);

    // 3. Update DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      successTitle: "Berhasil",
      successDesc: "Password berhasil diubah",
      errorTitle: null,
      errorDesc: null,
    };
  } catch (error) {
    console.error("Change Password Error:", error);
    return {
      errorTitle: "Gagal Ganti Password",
      errorDesc: "Terjadi kesalahan server",
      successTitle: null,
      successDesc: null,
    };
  }
}
