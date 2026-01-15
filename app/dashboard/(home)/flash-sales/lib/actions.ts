"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!!;
const NEXT_PUBLIC_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!!;

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_KEY
);

export async function getFlashSales() {
  try {
    const flashSales = await prisma.flashSale.findMany({
      include: {
        flight: {
          include: { plane: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return flashSales;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getFlashSaleById(id: string) {
  try {
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        flight: {
          include: { plane: true },
        },
      },
    });
    return flashSale;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getActiveFlights() {
  try {
    const flights = await prisma.flight.findMany({
      where: {
        departureDate: { gte: new Date() },
        status: "SCHEDULED",
      },
      include: { plane: true },
      orderBy: { departureDate: "asc" },
    });
    return flights;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function saveFlashSale(currentState: any, formData: FormData) {
  const imageFile = formData.get("image") as File;
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    flightId: formData.get("flightId") as string,
    discountPercent: Number(formData.get("discountPercent")),
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    maxQuota: Number(formData.get("maxQuota")),
  };

  // Validation
  if (!rawData.title || rawData.title.length < 3) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Title is required (min 3 chars)",
    };
  }
  if (!rawData.flightId) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Please select a flight",
    };
  }
  if (
    !rawData.discountPercent ||
    rawData.discountPercent < 1 ||
    rawData.discountPercent > 90
  ) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Discount must be between 1-90%",
    };
  }
  if (!rawData.startDate || !rawData.endDate) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Start and end dates are required",
    };
  }
  if (new Date(rawData.endDate) <= new Date(rawData.startDate)) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "End date must be after start date",
    };
  }

  try {
    let imageUrl: string | null = null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const filename = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ImageUpload")
        .upload(`public/flashsales/${filename}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return { errorTitle: "Upload Error", errorDesc: uploadError.message };
      }

      imageUrl = supabase.storage
        .from("ImageUpload")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    await prisma.flashSale.create({
      data: {
        title: rawData.title,
        description: rawData.description || null,
        flightId: rawData.flightId,
        discountPercent: rawData.discountPercent,
        startDate: new Date(rawData.startDate),
        endDate: new Date(rawData.endDate),
        maxQuota: rawData.maxQuota || 10,
        image: imageUrl,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Database Error",
      errorDesc: "Failed to create flash sale",
    };
  }

  revalidatePath("/dashboard/flash-sales");
  revalidatePath("/");
  redirect("/dashboard/flash-sales");
}

export async function updateFlashSale(
  id: string,
  currentState: any,
  formData: FormData
) {
  const imageFile = formData.get("image") as File;
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    flightId: formData.get("flightId") as string,
    discountPercent: Number(formData.get("discountPercent")),
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    maxQuota: Number(formData.get("maxQuota")),
    isActive: formData.get("isActive") === "true",
  };

  // Validation
  if (!rawData.title || rawData.title.length < 3) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Title is required (min 3 chars)",
    };
  }
  if (
    !rawData.discountPercent ||
    rawData.discountPercent < 1 ||
    rawData.discountPercent > 90
  ) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Discount must be between 1-90%",
    };
  }

  try {
    let imageUrl: string | undefined;

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      const filename = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ImageUpload")
        .upload(`public/flashsales/${filename}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return { errorTitle: "Upload Error", errorDesc: uploadError.message };
      }

      imageUrl = supabase.storage
        .from("ImageUpload")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    await prisma.flashSale.update({
      where: { id },
      data: {
        title: rawData.title,
        description: rawData.description || null,
        flightId: rawData.flightId,
        discountPercent: rawData.discountPercent,
        startDate: new Date(rawData.startDate),
        endDate: new Date(rawData.endDate),
        maxQuota: rawData.maxQuota,
        isActive: rawData.isActive,
        ...(imageUrl && { image: imageUrl }),
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Database Error",
      errorDesc: "Failed to update flash sale",
    };
  }

  revalidatePath("/dashboard/flash-sales");
  revalidatePath("/");
  redirect("/dashboard/flash-sales");
}

export async function deleteFlashSale(id: string) {
  try {
    await prisma.flashSale.delete({ where: { id } });
    revalidatePath("/dashboard/flash-sales");
    revalidatePath("/");
    return {
      successTitle: "Deleted",
      successDesc: "Flash sale has been deleted",
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Delete Failed",
      errorDesc: "Failed to delete flash sale",
    };
  }
}

export async function toggleFlashSaleStatus(id: string, isActive: boolean) {
  try {
    await prisma.flashSale.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/flash-sales");
    revalidatePath("/");
    return {
      successTitle: "Updated",
      successDesc: `Flash sale is now ${isActive ? "active" : "inactive"}`,
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Update Failed",
      errorDesc: "Failed to update status",
    };
  }
}
