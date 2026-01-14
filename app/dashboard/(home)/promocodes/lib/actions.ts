"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ActionResult } from "@/app/dashboard/(auth)/signin/form/action";

const promoCodeSchema = z.object({
  code: z.string({ required_error: "Code is required" }).min(3),
  discount: z.string({ required_error: "Discount is required" }),
  isActive: z.string().optional(),
  validUntil: z.string().optional(),
});

export async function savePromoCode(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const parse = promoCodeSchema.safeParse({
    code: formData.get("code"),
    discount: formData.get("discount"),
    isActive: formData.get("isActive"),
    validUntil: formData.get("validUntil"),
  });

  if (!parse.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: parse.error.issues.map((issue) => issue.message).join(", "),
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    await prisma.promoCode.create({
      data: {
        code: parse.data.code,
        discount: Number(parse.data.discount),
        isActive: parse.data.isActive === "on",
        validUntil: parse.data.validUntil
          ? new Date(parse.data.validUntil)
          : null,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Error",
      errorDesc: "Internal Server Error",
      successTitle: null,
      successDesc: null,
    };
  }

  revalidatePath("/dashboard/promocodes");
  redirect("/dashboard/promocodes");
}

export async function updatePromoCode(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const parse = promoCodeSchema.safeParse({
    code: formData.get("code"),
    discount: formData.get("discount"),
    isActive: formData.get("isActive"),
    validUntil: formData.get("validUntil"),
  });

  if (!parse.success) {
    return {
      errorTitle: "Validation Error",
      errorDesc: parse.error.issues.map((issue) => issue.message).join(", "),
      successTitle: null,
      successDesc: null,
    };
  }

  try {
    await prisma.promoCode.update({
      where: { id },
      data: {
        code: parse.data.code,
        discount: Number(parse.data.discount),
        isActive: parse.data.isActive === "on",
        validUntil: parse.data.validUntil
          ? new Date(parse.data.validUntil)
          : null,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Error",
      errorDesc: "Internal Server Error",
      successTitle: null,
      successDesc: null,
    };
  }

  revalidatePath("/dashboard/promocodes");
  redirect("/dashboard/promocodes");
}

export async function deletePromoCode(id: string): Promise<ActionResult> {
  try {
    await prisma.promoCode.delete({
      where: { id },
    });

    revalidatePath("/dashboard/promocodes");
    return {
      errorTitle: null,
      errorDesc: null,
      successTitle: "Success",
      successDesc: "Promo Code deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      errorTitle: "Error",
      errorDesc: "Internal Server Error",
      successTitle: null,
      successDesc: null,
    };
  }
}
