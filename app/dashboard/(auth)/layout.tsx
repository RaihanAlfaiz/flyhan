import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard Sign In",
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getUser();

  // If user is logged in
  if (session && user) {
    // If user is admin, redirect to dashboard
    if (user.role === "ADMIN") {
      redirect("/dashboard");
    }
    // If user is customer, redirect to home (they shouldn't access dashboard)
    redirect("/");
  }

  return <>{children}</>;
}
