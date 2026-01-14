import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpenText,
  Plane,
  Ticket,
  User,
  TicketPercent,
  LayoutDashboard,
  Bell,
  Search,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import ButtonLogout from "./components/button-logout";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FlyHan Dashboard",
};

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const masterDataItems = [
  {
    title: "Airplanes",
    href: "/dashboard/airplanes",
    icon: Plane,
  },
  {
    title: "Flights",
    href: "/dashboard/flights",
    icon: BookOpenText,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: User,
  },
  {
    title: "Promo Codes",
    href: "/dashboard/promocodes",
    icon: TicketPercent,
  },
  {
    title: "Refund Requests",
    href: "/dashboard/refund-requests",
    icon: RefreshCw,
  },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getUser();

  if (session === null || !user) {
    return redirect("/dashboard/signin");
  }

  if (user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar - SB Admin 2 Style */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-gradient-to-b from-[#4e73df] via-[#224abe] to-[#224abe] transition-transform">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-blue-400/30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">FlyHan Admin</span>
          </Link>
        </div>

        {/* Divider */}
        <hr className="mx-4 my-3 border-blue-400/30" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3">
          {/* Main Menu */}
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded px-3 py-2.5 text-sm font-medium text-blue-100 transition-all hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}

          {/* Divider */}
          <hr className="my-3 border-blue-400/30" />

          {/* Section Header */}
          <div className="px-3 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200/70">
              Master Data
            </span>
          </div>

          {masterDataItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded px-3 py-2.5 text-sm font-medium text-blue-100 transition-all hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}

          {/* Divider */}
          <hr className="my-3 border-blue-400/30" />

          {/* Account Section */}
          <div className="px-3 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200/70">
              Account
            </span>
          </div>
          <ButtonLogout />
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-3 rounded bg-white/10 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-blue-200">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-56">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-6 shadow">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for..."
                className="h-9 w-64 rounded-full border border-gray-300 bg-gray-50 pl-4 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#4e73df] text-white hover:bg-[#2e59d9]">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300" />

            {/* User Dropdown */}
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-gray-600 hidden md:block">
                {user.name}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4e73df] text-sm font-bold text-white">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
