import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Plane,
  Users,
  Ticket,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  User,
} from "lucide-react";
import Image from "next/image";
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
  const user = await getUser();

  // Statistics Data
  const [
    airplaneCount,
    flightCount,
    ticketCount,
    customerCount,
    recentTickets,
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
  ]);

  const stats = [
    {
      label: "Total Pesawat",
      value: airplaneCount,
      icon: Plane,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      desc: "Armada tersedia",
    },
    {
      label: "Penerbangan Aktif",
      value: flightCount,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      desc: "Jadwal mendatang",
    },
    {
      label: "Tiket Terjual",
      value: ticketCount,
      icon: Ticket,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      desc: "Transaksi sukses",
    },
    {
      label: "Total Pelanggan",
      value: customerCount,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      desc: "User terdaftar",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Selamat Datang, {user?.name || "Admin"} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Berikut adalah ringkasan performa bisnis penerbangan hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${stat.bg} ${stat.color} bg-opacity-50`}
              >
                {stat.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Transaksi Terbaru
              </h2>
              <p className="text-sm text-gray-500">
                5 tiket terakhir yang berhasil dibooking
              </p>
            </div>
            <Link
              href="/dashboard/tickets"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Belum ada transaksi tiket.
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {ticket.customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.flight.plane.code} • {ticket.seat.seatNumber}
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
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Actions or Promo Banner */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plane className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-bold mb-2 relative z-10">
              Tambah Penerbangan Baru
            </h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">
              Jadwalkan rute penerbangan baru untuk pelanggan.
            </p>
            <Link href="/dashboard/flights/create">
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors w-full relative z-10">
                + Buat Penerbangan
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Status Integrasi</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Database System</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
