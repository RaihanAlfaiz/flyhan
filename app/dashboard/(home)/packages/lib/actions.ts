"use server";

import prisma from "@/lib/prisma";
import { packageFormSchema } from "./validation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!!;
const NEXT_PUBLIC_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!!;

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_KEY
);

export async function getPackages() {
  try {
    const packages = await prisma.flightPackage.findMany({
      orderBy: {
        title: "asc", // Order by title initially
      },
    });
    return packages;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function savePackage(currentState: any, formData: FormData) {
  const images = formData.get("image") as File;
  const rawData = {
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
    features: formData.get("features"),
  };

  const validate = packageFormSchema.safeParse({ ...rawData, image: images });

  if (!validate.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: validate.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  try {
    // 1. Upload Image
    const filename = `${Date.now()}-${images.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ImageUpload")
      .upload(`public/packages/${filename}`, images, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return {
        errorTitle: "Upload Error",
        errorDesc: uploadError.message,
      };
    }

    const imageUrl = supabase.storage
      .from("ImageUpload")
      .getPublicUrl(uploadData.path).data.publicUrl;

    // 2. Parse Features (Comma separated -> Array)
    const featuresArray = (validate.data.features as string)
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // 3. Save to DB
    await prisma.flightPackage.create({
      data: {
        title: validate.data.title,
        description: validate.data.description,
        price: Number(validate.data.price),
        image: imageUrl,
        features: featuresArray,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Database Error",
      errorDesc: "Failed to create package",
    };
  }

  revalidatePath("/dashboard/packages");
  revalidatePath("/");
  redirect("/dashboard/packages");
}

export async function deletePackage(id: string) {
  try {
    const pkg = await prisma.flightPackage.findUnique({ where: { id } });
    if (!pkg) {
      return {
        errorTitle: "Not Found",
        errorDesc: "Package not found",
      };
    }

    // Delete image if needed - Logic to extract path from URL
    // const match = pkg.image.match(/ImageUpload\/(.+)$/);
    // if (match) {
    //   await supabase.storage.from("ImageUpload").remove([match[1]]);
    // }

    await prisma.flightPackage.delete({ where: { id } });
    revalidatePath("/dashboard/packages");
    revalidatePath("/");
    return {
      successTitle: "Success",
      successDesc: "Package has been deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Failed to delete",
      errorDesc: "Something went wrong, please try again",
    };
  }
}

export async function getPackageById(id: string) {
  try {
    const pkg = await prisma.flightPackage.findUnique({
      where: { id },
    });
    return pkg;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updatePackage(
  id: string,
  currentState: any,
  formData: FormData
) {
  const imageFile = formData.get("image") as File;
  const rawData = {
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
    features: formData.get("features"),
  };

  // Validate without requiring image if not provided
  const hasNewImage = imageFile && imageFile.size > 0;

  // Basic validation
  if (!rawData.title || (rawData.title as string).length < 4) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Title must be at least 4 characters",
    };
  }

  if (!rawData.price) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Price is required",
    };
  }

  if (!rawData.description || (rawData.description as string).length < 10) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Description must be at least 10 characters",
    };
  }

  if (!rawData.features || (rawData.features as string).length < 3) {
    return {
      errorTitle: "Validation Error",
      errorDesc: "Features are required",
    };
  }

  try {
    let imageUrl: string | undefined;

    // Upload new image if provided
    if (hasNewImage) {
      const filename = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("ImageUpload")
        .upload(`public/packages/${filename}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return {
          errorTitle: "Upload Error",
          errorDesc: uploadError.message,
        };
      }

      imageUrl = supabase.storage
        .from("ImageUpload")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    // Parse Features
    const featuresArray = (rawData.features as string)
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Update DB
    await prisma.flightPackage.update({
      where: { id },
      data: {
        title: rawData.title as string,
        description: rawData.description as string,
        price: Number(rawData.price),
        features: featuresArray,
        ...(imageUrl && { image: imageUrl }),
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Database Error",
      errorDesc: "Failed to update package",
    };
  }

  revalidatePath("/dashboard/packages");
  revalidatePath("/");
  redirect("/dashboard/packages");
}
