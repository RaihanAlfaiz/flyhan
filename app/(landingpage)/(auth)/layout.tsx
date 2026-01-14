import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session } = await getUser();

  // If user is already logged in, redirect to home
  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
