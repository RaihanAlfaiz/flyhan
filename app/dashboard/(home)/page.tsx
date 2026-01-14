import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Plane,
  Users,
  Ticket,
  CalendarDays,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: bigint | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const { user } = await getUser();

  // Statistics Data
  const [
    airplaneCount,
    flightCount,
    ticketCount,
    customerCount,
    recentTickets,
    totalRevenue,
  ] = await Promise.all([
    prisma.airplane.count(),
    prisma.flight.count({
      where: { departureDate: { gte: new Date() } },
    }),
    prisma.ticket.count({ where: { status: "SUCCESS" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.ticket.findMany({
      take: 5,
      orderBy: { bookingDate: "desc" },
      where: { status: "SUCCESS" },
      include: {
        customer: true,
        flight: {
          include: { plane: true },
        },
        seat: true,
      },
    }),
    prisma.ticket.aggregate({
      where: { status: "SUCCESS" },
      _sum: { price: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue._sum.price || 0),
      icon: DollarSign,
      borderColor: "border-l-[#4e73df]",
      textColor: "text-[#4e73df]",
    },
    {
      label: "Total Flights",
      value: flightCount,
      icon: CalendarDays,
      borderColor: "border-l-[#1cc88a]",
      textColor: "text-[#1cc88a]",
    },
    {
      label: "Tickets Sold",
      value: ticketCount,
      icon: Ticket,
      borderColor: "border-l-[#36b9cc]",
      textColor: "text-[#36b9cc]",
    },
    {
      label: "Total Customers",
      value: customerCount,
      icon: Users,
      borderColor: "border-l-[#f6c23e]",
      textColor: "text-[#f6c23e]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link
          href="/dashboard/flights/create"
          className="inline-flex items-center gap-2 rounded bg-[#4e73df] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e59d9] transition-colors"
        >
          <Plane className="h-4 w-4" />
          Add New Flight
        </Link>
      </div>

      {/* Stats Cards - SB Admin 2 Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded shadow border-l-4 ${stat.borderColor} p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold uppercase ${stat.textColor}`}>
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded shadow">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h6 className="text-[#4e73df] font-bold">Recent Transactions</h6>
            <Link
              href="/dashboard/tickets"
              className="text-sm text-gray-500 hover:text-[#4e73df] flex items-center gap-1"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {recentTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No transactions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#4e73df] flex items-center justify-center text-white text-sm font-bold">
                        {ticket.customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {ticket.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.flight.plane.code} • Seat{" "}
                          {ticket.seat.seatNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">
                        {formatCurrency(ticket.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(ticket.bookingDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h6 className="text-[#4e73df] font-bold">Quick Stats</h6>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Airplanes</span>
              <span className="text-sm font-bold text-gray-800">
                {airplaneCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#4e73df] h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">Active Flights</span>
              <span className="text-sm font-bold text-gray-800">
                {flightCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#1cc88a] h-2 rounded-full"
                style={{ width: "80%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">Tickets Sold</span>
              <span className="text-sm font-bold text-gray-800">
                {ticketCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#36b9cc] h-2 rounded-full"
                style={{ width: "60%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">Registered Users</span>
              <span className="text-sm font-bold text-gray-800">
                {customerCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#f6c23e] h-2 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
