"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "./validation";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/bcrypt";
import { lucia } from "@/lib/auth";
import { cookies, headers } from "next/headers";

export interface ActionResult {
  errorTitle: string | null;
  errorDesc: string | null;
  successTitle: string | null;
  successDesc: string | null;
}

export async function handleSignUp(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const value = signupSchema.safeParse({
    name: formData.get("name"),
    passport: formData.get("passport"),
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

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: value.data.email,
    },
  });

  if (existingUser) {
    return {
      errorTitle: "Email already registered",
      errorDesc:
        "An account with this email already exists. Please sign in instead.",
      successTitle: null,
      successDesc: null,
    };
  }

  // Hash password
  const hashedPassword = await hash(value.data.password, 10);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: value.data.name,
      email: value.data.email,
      password: hashedPassword,
      passport: value.data.passport,
      role: "CUSTOMER",
    },
  });

  // Create session and set cookie
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ua = headersList.get("user-agent") || "unknown";

  const session = await lucia.createSession(newUser.id, {
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

  // Redirect to home page after successful signup
  redirect("/");
}
