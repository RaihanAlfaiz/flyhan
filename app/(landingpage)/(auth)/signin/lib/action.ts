"use server";

import { redirect } from "next/navigation";
import { signinSchema } from "./validation";
import prisma from "@/lib/prisma";
import { compare } from "@node-rs/bcrypt";
import { lucia } from "@/lib/auth";
import { cookies, headers } from "next/headers";

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
  const value = signinSchema.safeParse({
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

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: value.data.email,
    },
  });

  if (!existingUser) {
    return {
      errorTitle: "User not found",
      errorDesc: "No account found with this email address.",
      successTitle: null,
      successDesc: null,
    };
  }

  // Verify password
  const validPassword = await compare(
    value.data.password,
    existingUser.password
  );

  if (!validPassword) {
    return {
      errorTitle: "Invalid password",
      errorDesc: "The password you entered is incorrect.",
      successTitle: null,
      successDesc: null,
    };
  }

  // Create session and set cookie
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ua = headersList.get("user-agent") || "unknown";

  const session = await lucia.createSession(existingUser.id, {
    ipAddress: ip,
    userAgent: ua,
    lastActive: new Date(),
  });
  const sessionCookie = await lucia.createSessionCookie(session.id);

  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  // Redirect based on role
  if (existingUser.role === "ADMIN") {
    redirect("/dashboard");
  }

  redirect("/");
}
