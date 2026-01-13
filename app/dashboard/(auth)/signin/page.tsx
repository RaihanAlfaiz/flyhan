import { Metadata } from "next";
import FormSignin from "./form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Sign In",
};

export default async function SignInPage() {
  const { session, user } = await getUser();
  if (session || user) {
    return redirect("/dashboard");
  }
  return <FormSignin />;
}
