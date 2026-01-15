import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Plane,
  Users,
  Ticket,
  CalendarDays,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card/Card";
import PageHeader from "./ui/page-header/PageHeader";
import MetricCard from "./ui/metric-card/MetricCard";
import Button from "./ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";
import Badge from "./ui/badge/Badge";

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

  const [
    airplaneCount,
    flightCount,
    ticketCount,
    customerCount,
    recentTickets,
    totalRevenue,
    pendingRefunds,
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
    prisma.refundRequest.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
        actions={
          <Link href="/dashboard/flights/create">
            <Button startIcon={<Plane className="h-4 w-4" />}>
              Add New Flight
            </Button>
          </Link>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue._sum.price || 0)}
          icon={
            <DollarSign className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-brand-50 dark:bg-brand-500/15"
        />
        <MetricCard
          title="Active Flights"
          value={flightCount.toString()}
          icon={
            <CalendarDays className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-green-50 dark:bg-green-500/15"
        />
        <MetricCard
          title="Tickets Sold"
          value={ticketCount.toString()}
          icon={<Ticket className="text-gray-800 dark:text-white/90 w-6 h-6" />}
          iconBgColor="bg-blue-50 dark:bg-blue-500/15"
        />
        <MetricCard
          title="Total Customers"
          value={customerCount.toString()}
          icon={<Users className="text-gray-800 dark:text-white/90 w-6 h-6" />}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
        />
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Recent Orders Table */}
        <div className="col-span-12 xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <Link
                href="/dashboard/tickets"
                className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1"
              >
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Flight
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Seat
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentTickets.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                              {ticket.customer.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                {ticket.customer.name}
                              </span>
                              <span className="block text-gray-500 text-xs dark:text-gray-400">
                                {ticket.customer.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                          {ticket.flight.plane.code}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color="primary">
                            {ticket.seat.seatNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 font-medium text-sm dark:text-white/90">
                          {formatCurrency(ticket.price)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                          {formatDate(ticket.bookingDate)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="col-span-12 xl:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Airplanes
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                    {airplaneCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Flights
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                    {flightCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tickets Sold
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                    {ticketCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Refunds
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                    {pendingRefunds}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-800">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min(pendingRefunds * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href="/dashboard/refund-requests"
                  className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1"
                >
                  View Refund Requests <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
