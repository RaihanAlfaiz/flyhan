"use server";

import type { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";
import { airplaneFormSchema } from "./validation";
import { redirect } from "next/navigation";
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPathFromUrl,
} from "@/lib/supabase";
import prisma from "@/lib/prisma";

export async function saveAirplane(
  prevState: any,
  formtData: FormData
): Promise<ActionResult> {
  const values = airplaneFormSchema.safeParse({
    name: formtData.get("name"),
    image: formtData.get("image"),
    code: formtData.get("code"),
  });

  if (!values.success) {
    const errorDesc = values.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return {
      errorTitle: "Error Validation",
      errorDesc,
      successTitle: null,
      successDesc: null,
    };
  }

  // Check if airplane code already exists
  const existingAirplane = await prisma.airplane.findFirst({
    where: { code: values.data.code },
  });

  if (existingAirplane) {
    return {
      errorTitle: "Kode Pesawat Sudah Ada",
      errorDesc: `Pesawat dengan kode ${values.data.code} sudah terdaftar.`,
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    // Upload image to Supabase
    const uploadedFile = await uploadFile(values.data.image as File);
    const imageUrl = getPublicUrl(uploadedFile.path);

    // Save airplane to database
    await prisma.airplane.create({
      data: {
        code: values.data.code,
        name: values.data.name,
        image: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error saving airplane:", error);
    return {
      errorTitle: "Gagal Menyimpan Data",
      errorDesc:
        "Terjadi kesalahan saat menyimpan data pesawat. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }

  redirect("/dashboard/airplanes");
}

export async function updateAirplane(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const imageFile = formData.get("image") as File;
  const hasNewImage = imageFile && imageFile.size > 0;

  // Validate form data
  const validationData: any = {
    name: formData.get("name"),
    code: formData.get("code"),
  };

  // Only validate image if a new one is uploaded
  if (hasNewImage) {
    validationData.image = imageFile;
  }

  const values = hasNewImage
    ? airplaneFormSchema.safeParse(validationData)
    : airplaneFormSchema.omit({ image: true }).safeParse(validationData);

  if (!values.success) {
    const errorDesc = values.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return {
      errorTitle: "Error Validation",
      errorDesc,
      successTitle: null,
      successDesc: null,
    };
  }

  // Check if code is taken by another airplane
  const existingAirplane = await prisma.airplane.findFirst({
    where: {
      code: values.data.code,
      NOT: { id },
    },
  });

  if (existingAirplane) {
    return {
      errorTitle: "Kode Pesawat Sudah Ada",
      errorDesc: `Pesawat dengan kode ${values.data.code} sudah terdaftar.`,
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    const currentAirplane = await prisma.airplane.findUnique({
      where: { id },
    });

    let imageUrl = currentAirplane?.image;

    // If new image uploaded, upload it and delete old one
    if (hasNewImage) {
      const uploadedFile = await uploadFile(imageFile);
      imageUrl = getPublicUrl(uploadedFile.path);

      // Delete old image if exists
      if (currentAirplane?.image) {
        const oldPath = getPathFromUrl(currentAirplane.image);
        if (oldPath) {
          try {
            await deleteFile(oldPath);
          } catch (e) {
            console.error("Failed to delete old image:", e);
          }
        }
      }
    }

    await prisma.airplane.update({
      where: { id },
      data: {
        code: values.data.code,
        name: values.data.name,
        image: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error updating airplane:", error);
    return {
      errorTitle: "Gagal Mengupdate Data",
      errorDesc:
        "Terjadi kesalahan saat mengupdate data pesawat. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }

  redirect("/dashboard/airplanes");
}

export async function deleteAirplane(id: string): Promise<ActionResult> {
  try {
    const airplane = await prisma.airplane.findUnique({
      where: { id },
    });

    if (!airplane) {
      return {
        errorTitle: "Pesawat Tidak Ditemukan",
        errorDesc: "Data pesawat tidak ditemukan.",
        successTitle: null,
        successDesc: null,
      };
    }

    // Delete image from storage
    if (airplane.image) {
      const imagePath = getPathFromUrl(airplane.image);
      if (imagePath) {
        try {
          await deleteFile(imagePath);
        } catch (e) {
          console.error("Failed to delete image:", e);
        }
      }
    }

    // Delete airplane from database
    await prisma.airplane.delete({
      where: { id },
    });

    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Berhasil",
      successDesc: "Data pesawat berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleting airplane:", error);
    return {
      errorTitle: "Gagal Menghapus Data",
      errorDesc:
        "Terjadi kesalahan saat menghapus data pesawat. Silakan coba lagi.",
      successTitle: null,
      successDesc: null,
    };
  }
}
