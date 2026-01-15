"use server";

import prisma from "@/lib/prisma";
import { flightAddonFormSchema } from "./validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AddonActionResult = {
  errorTitle: string | null;
  errorDesc: string[] | null;
};

export async function saveFlightAddon(
  prevState: any,
  formData: FormData
): Promise<AddonActionResult> {
  const code = formData.get("code") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const id = formData.get("id") as string | null;

  const validate = flightAddonFormSchema.safeParse({
    code,
    title,
    description,
    price,
  });

  if (!validate.success) {
    const errorDesc = validate.error.issues.map((issue) => issue.message);
    return {
      errorTitle: "Error Validation",
      errorDesc,
    };
  }

  const dataPrice = parseInt(price);

  try {
    if (id) {
      await prisma.flightAddon.update({
        where: { id },
        data: {
          code,
          title,
          description,
          price: dataPrice,
        },
      });
    } else {
      const existing = await prisma.flightAddon.findUnique({ where: { code } });
      if (existing) {
        return {
          errorTitle: "Duplicate Code",
          errorDesc: ["Code Addon already exists, please use another code."],
        };
      }
      await prisma.flightAddon.create({
        data: {
          code,
          title,
          description,
          price: dataPrice,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Error Database",
      errorDesc: ["Something went wrong"],
    };
  }

  revalidatePath("/dashboard/flight-addons");
  redirect("/dashboard/flight-addons");
}

export async function deleteFlightAddon(
  id: string
): Promise<AddonActionResult | undefined> {
  try {
    await prisma.flightAddon.delete({
      where: { id },
    });
    revalidatePath("/dashboard/flight-addons");
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Failed to delete",
      errorDesc: ["Data might be related to other records."],
    };
  }
}
