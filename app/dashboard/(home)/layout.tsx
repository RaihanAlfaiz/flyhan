import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpenText, Plane, Ticket, User } from "lucide-react";
import ButtonLogout from "./components/button-logout";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getUser();

  // If not logged in, redirect to signin
  if (session === null || !user) {
    return redirect("/dashboard/signin");
  }

  // If logged in but not admin (customer), redirect to home
  if (user.role !== "ADMIN") {
    return redirect("/");
  }
  return (
    <section>
      <nav className="border-b border-muted p-5">
        <div className="flex flex-row items-center justify-between">
          <span className="font-bold text-primary">Flyhan Dashboard</span>
        </div>
      </nav>
      <div className="flex flex-row">
        <aside className="w-[20%] h-screen shadow p-5 space-y-5">
          <div className="space-y-2">
            <Button variant={"ghost"} asChild className="w-full justify-start">
              <Link href={"/dashboard"}>Dashboard</Link>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="uppercase text-xs font-bold">Master Data</div>
            <Button variant={"ghost"} asChild className="w-full justify-start">
              <Link href={"/dashboard/airplanes"}>
                <Plane className="mr-2 w-4 h-4" />
                Airplane
              </Link>
            </Button>
            <Button variant={"ghost"} asChild className="w-full justify-start">
              <Link href={"/dashboard/flights"}>
                <BookOpenText className="mr-2 w-4 h-4" />
                Flights
              </Link>
            </Button>
            <Button variant={"ghost"} asChild className="w-full justify-start">
              <Link href={"/dashboard/tickets"}>
                <Ticket className="mr-2 w-4 h-4" />
                Tickets
              </Link>
            </Button>
            <Button variant={"ghost"} asChild className="w-full justify-start">
              <Link href={"/dashboard/users"}>
                <User className="mr-2 w-4 h-4" />
                Users
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <ButtonLogout />
          </div>
        </aside>

        <main className="grow p-6 h-[87vh] overflow-y-auto">{children}</main>
      </div>
    </section>
  );
}
