"use server";

import { redirect } from "next/navigation";
import { formSchema } from "./validation";
import prisma from "@/lib/prisma";
import { compare } from "@node-rs/bcrypt";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export interface ActionResult {
  errorTitle: string | null;
  errorDesc: string | null;
  successTitle: string | null;
  successDesc: string | null;
}

export async function handleSignIn(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const value = formSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!value.success) {
    const errors = value.error.flatten().fieldErrors;
    const errorMessages = Object.values(errors).flat().join(", ");
    return {
      errorTitle: "Invalid input",
      errorDesc: errorMessages,
      successTitle: null,
      successDesc: null,
    };
  }

  // TODO: Add actual authentication logic here
  const existingUser = await prisma.user.findFirst({
    where: {
      email: value.data.email,
    },
  });

  if (!existingUser) {
    return {
      errorTitle: "User not found",
      errorDesc: "User not found",
      successTitle: null,
      successDesc: null,
    };
  }

  const validPassword = await compare(
    value.data.password,
    existingUser.password
  );

  if (!validPassword) {
    return {
      errorTitle: "Invalid password",
      errorDesc: "Invalid password",
      successTitle: null,
      successDesc: null,
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = await lucia.createSessionCookie(session.id);

  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  redirect("/dashboard");
}
