import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Plane,
  Users,
  Ticket,
  CalendarDays,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { user } = await getUser();

  const [
    // Counts
    airplaneCount,
    flightCount,
    ticketCount,
    customerCount,
    packageCount,
    packageOrderCount,
    // Recent Data
    recentTickets,
    recentPackageOrders,
    // Revenue
    ticketRevenue,
    packageRevenue,
    // Status Counts
    pendingRefunds,
    pendingPackageOrders,
    successPackageOrders,
    // Upcoming Flights
    upcomingFlights,
    // Today stats
    todayTickets,
    todayPackageOrders,
  ] = await Promise.all([
    // Counts
    prisma.airplane.count(),
    prisma.flight.count({ where: { departureDate: { gte: new Date() } } }),
    prisma.ticket.count({ where: { status: "SUCCESS" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.flightPackage.count(),
    prisma.packageOrder.count(),
    // Recent Tickets
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
    // Recent Package Orders
    prisma.packageOrder.findMany({
      take: 5,
      orderBy: { orderDate: "desc" },
      include: {
        package: true,
        customer: { select: { name: true, email: true } },
      },
    }),
    // Revenue
    prisma.ticket.aggregate({
      where: { status: "SUCCESS" },
      _sum: { price: true },
    }),
    prisma.packageOrder.aggregate({
      where: { status: "SUCCESS" },
      _sum: { totalPrice: true },
    }),
    // Status counts
    prisma.refundRequest.count({ where: { status: "PENDING" } }),
    prisma.packageOrder.count({ where: { status: "PENDING" } }),
    prisma.packageOrder.count({ where: { status: "SUCCESS" } }),
    // Upcoming Flights
    prisma.flight.findMany({
      take: 5,
      where: { departureDate: { gte: new Date() } },
      orderBy: { departureDate: "asc" },
      include: { plane: true },
    }),
    // Today stats
    prisma.ticket.count({
      where: {
        status: "SUCCESS",
        bookingDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.packageOrder.count({
      where: {
        orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const totalRevenue =
    Number(ticketRevenue._sum.price || 0) +
    Number(packageRevenue._sum.totalPrice || 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/flights/create">
            <Button startIcon={<Plane className="h-4 w-4" />}>
              Add Flight
            </Button>
          </Link>
          <Link href="/dashboard/packages/create">
            <Button
              variant="outline"
              startIcon={<Package className="h-4 w-4" />}
            >
              Add Package
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-100 text-sm font-medium">
                  Today's Tickets
                </p>
                <p className="text-3xl font-bold mt-1">{todayTickets}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Ticket className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">
                  Today's Package Orders
                </p>
                <p className="text-3xl font-bold mt-1">{todayPackageOrders}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <ShoppingBag className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Airplanes"
          value={airplaneCount.toString()}
          icon={<Plane className="text-blue-600 w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-500/15"
        />
        <MetricCard
          title="Active Flights"
          value={flightCount.toString()}
          icon={<CalendarDays className="text-green-600 w-5 h-5" />}
          iconBgColor="bg-green-50 dark:bg-green-500/15"
        />
        <MetricCard
          title="Tickets Sold"
          value={ticketCount.toString()}
          icon={<Ticket className="text-purple-600 w-5 h-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-500/15"
        />
        <MetricCard
          title="Customers"
          value={customerCount.toString()}
          icon={<Users className="text-amber-600 w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
        />
        <MetricCard
          title="Packages"
          value={packageCount.toString()}
          icon={<Package className="text-pink-600 w-5 h-5" />}
          iconBgColor="bg-pink-50 dark:bg-pink-500/15"
        />
        <MetricCard
          title="Package Orders"
          value={packageOrderCount.toString()}
          icon={<ShoppingBag className="text-cyan-600 w-5 h-5" />}
          iconBgColor="bg-cyan-50 dark:bg-cyan-500/15"
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Refunds</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingRefunds}
              </p>
            </div>
            {pendingRefunds > 0 && (
              <Link
                href="/dashboard/refund-requests"
                className="ml-auto text-brand-500 hover:text-brand-600"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-500/20">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingPackageOrders}
              </p>
            </div>
            {pendingPackageOrders > 0 && (
              <Link
                href="/dashboard/package-orders"
                className="ml-auto text-brand-500 hover:text-brand-600"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Success Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {successPackageOrders}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Package Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(packageRevenue._sum.totalPrice || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Ticket Transactions */}
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Ticket Sales</CardTitle>
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
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm"
                    >
                      Route
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm"
                    >
                      Seat
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm"
                    >
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentTickets.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center text-gray-400">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                              {ticket.customer.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                                {ticket.customer.name}
                              </span>
                              <span className="block text-gray-500 text-xs">
                                {formatDate(ticket.bookingDate)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {ticket.flight.departureCityCode}
                            </span>
                            <Plane className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {ticket.flight.destinationCityCode}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge size="sm" color="primary">
                            {ticket.seat.seatNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 font-semibold text-sm dark:text-white/90">
                          {formatCurrency(ticket.price)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Upcoming Flights */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Flights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingFlights.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No upcoming flights
                </p>
              ) : (
                upcomingFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-500/20">
                      <Plane className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-white truncate">
                        {flight.departureCity} → {flight.destinationCity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(flight.departureDate)} •{" "}
                        {formatTime(flight.departureDate)}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {flight.plane.code}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Package Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Package Orders</CardTitle>
              <Link
                href="/dashboard/package-orders"
                className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1"
              >
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPackageOrders.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No orders yet
                </p>
              ) : (
                recentPackageOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/package-orders/${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={order.package.image}
                        alt={order.package.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-white truncate">
                        {order.package.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.customer.name} • {order.quantity} pax
                      </p>
                    </div>
                    <Badge
                      size="sm"
                      color={
                        order.status === "SUCCESS"
                          ? "success"
                          : order.status === "PENDING"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
