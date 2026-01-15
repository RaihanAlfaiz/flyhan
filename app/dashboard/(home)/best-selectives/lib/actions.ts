"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bestSelectiveFormSchema } from "./validation";
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPathFromUrl,
} from "@/lib/supabase";

export type ActionResult = {
  errorTitle: string | null;
  errorDesc: string[] | null;
};

export async function saveBestSelective(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const image = formData.get("image") as File;
  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const url = formData.get("url") as string;
  const id = formData.get("id") as string | null;

  let validationResult;

  if (id && image.size === 0) {
    // Edit without new image -> omit image validation
    const schema = bestSelectiveFormSchema.omit({ image: true });
    validationResult = schema.safeParse({ title, subtitle, url });
  } else {
    // Create or Edit with new image -> check image
    validationResult = bestSelectiveFormSchema.safeParse({
      title,
      subtitle,
      url,
      image,
    });
  }

  if (!validationResult.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: validationResult.error.issues.map((i) => i.message),
    };
  }

  try {
    let imageUrl = "";

    if (id) {
      // UPDATE
      const current = await prisma.bestSelective.findUnique({ where: { id } });
      imageUrl = current?.image || "";

      if (image.size > 0) {
        // Upload new
        const uploaded = await uploadFile(image);
        imageUrl = getPublicUrl(uploaded.path);

        // Delete old
        if (current?.image) {
          const path = getPathFromUrl(current.image);
          if (path) await deleteFile(path);
        }
      }

      await prisma.bestSelective.update({
        where: { id },
        data: {
          title,
          subtitle,
          url,
          image: imageUrl,
        },
      });
    } else {
      // CREATE
      // Image validation passed, so image exists and valid
      const uploaded = await uploadFile(image);
      imageUrl = getPublicUrl(uploaded.path);

      await prisma.bestSelective.create({
        data: {
          title,
          subtitle,
          url,
          image: imageUrl,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Database Error",
      errorDesc: ["Something went wrong saving data."],
    };
  }

  revalidatePath("/dashboard/best-selectives");
  revalidatePath("/");
  redirect("/dashboard/best-selectives");
}

export async function deleteBestSelective(id: string) {
  try {
    const current = await prisma.bestSelective.findUnique({ where: { id } });
    if (current?.image) {
      const path = getPathFromUrl(current.image);
      if (path) await deleteFile(path);
    }

    await prisma.bestSelective.delete({ where: { id } });
    revalidatePath("/dashboard/best-selectives");
    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
}
