"use server";

import prisma from "@/lib/prisma";

export type DashboardPeriod = "daily" | "weekly" | "monthly";

export async function getDashboardData(period: DashboardPeriod) {
  const now = new Date();
  const startDate = new Date();

  // Define Range
  if (period === "daily") {
    startDate.setDate(now.getDate() - 30); // Last 30 Days
  } else if (period === "weekly") {
    startDate.setDate(now.getDate() - 7 * 12); // Last 12 Weeks
  } else if (period === "monthly") {
    startDate.setFullYear(now.getFullYear() - 1); // Last 12 Months
  }

  // Fetch Successful Tickets (Revenue & Bookings)
  const successTickets = await prisma.ticket.findMany({
    where: {
      bookingDate: { gte: startDate },
      status: "SUCCESS",
    },
    include: {
      flight: true,
    },
    orderBy: { bookingDate: "asc" },
  });

  // Fetch All Tickets for Conversion Rate
  const totalTicketsCount = await prisma.ticket.count({
    where: {
      bookingDate: { gte: startDate },
    },
  });

  // 1. Process Chart Data
  const chartDataMap = new Map<string, { revenue: number; bookings: number }>();

  successTickets.forEach((ticket) => {
    const date = new Date(ticket.bookingDate);
    let key = "";

    if (period === "daily") {
      key = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } else if (period === "weekly") {
      // Group by week start
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const weekStart = new Date(date.setDate(diff));
      key = weekStart.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } else if (period === "monthly") {
      key = date.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
    }

    const current = chartDataMap.get(key) || { revenue: 0, bookings: 0 };
    chartDataMap.set(key, {
      revenue: current.revenue + Number(ticket.price),
      bookings: current.bookings + 1,
    });
  });

  const chartData = Array.from(chartDataMap.entries()).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    bookings: data.bookings,
  }));

  // 2. Process Popular Routes
  const routesMap = new Map<string, number>();
  successTickets.forEach((ticket) => {
    const route = `${ticket.flight.departureCityCode} - ${ticket.flight.destinationCityCode}`;
    routesMap.set(route, (routesMap.get(route) || 0) + 1);
  });

  const popularRoutes = Array.from(routesMap.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Conversion Rate
  const conversionRate =
    totalTicketsCount > 0
      ? (successTickets.length / totalTicketsCount) * 100
      : 0;

  // 4. Totals
  const totalRevenue = successTickets.reduce(
    (acc, t) => acc + Number(t.price),
    0
  );
  const totalBookings = successTickets.length;

  return {
    chartData,
    popularRoutes,
    conversionRate,
    totalRevenue,
    totalBookings,
    tableData: successTickets.map((t) => ({
      id: t.id,
      code: t.code,
      flight: t.flight.departureCity + " -> " + t.flight.destinationCity,
      date: t.bookingDate,
      price: Number(t.price),
      status: t.status,
    })), // For export purpose
  };
}
