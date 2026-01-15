import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "FlyHan Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getUser();

  if (!session) {
    redirect("/signin");
  }

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <DashboardLayoutClient userName={user.name}>
      {children}
    </DashboardLayoutClient>
  );
}
