import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import CheckoutContent from "./components/checkout-content";

async function getPackageById(id: string) {
  try {
    const pkg = await prisma.flightPackage.findUnique({
      where: { id },
    });
    return pkg;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function PackageCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check auth
  const { session, user } = await getUser();

  if (!session || !user) {
    redirect("/signin");
  }

  const pkg = await getPackageById(id);

  if (!pkg) {
    notFound();
  }

  return <CheckoutContent pkg={pkg} userName={user.name} />;
}
