import React from "react";
import Link from "next/link";
import { getUpcomingFlights, getCounterBookingHistory } from "./lib/data";
import {
  Plane,
  Users,
  ArrowRight,
  Ticket,
  Clock,
  Calendar,
} from "lucide-react";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card/Card";

// Helper functions
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export default async function CounterBookingPage() {
  const flights = await getUpcomingFlights();
  const recentBookings = await getCounterBookingHistory(10);

  // Group flights by date
  const flightsByDate = flights.reduce((acc, flight) => {
    const dateKey = new Date(flight.departureDate).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(flight);
    return acc;
  }, {} as Record<string, typeof flights>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counter Booking"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Counter Booking" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {flights.length}
              </p>
              <p className="text-sm text-blue-600">Available Flights</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Ticket className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {recentBookings.length}
              </p>
              <p className="text-sm text-green-600">Recent Bookings</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {flights.reduce((sum, f) => sum + f.availableSeats, 0)}
              </p>
              <p className="text-sm text-purple-600">Available Seats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Flights */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                Select Flight
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(flightsByDate).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plane className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Flights Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    No upcoming flights for counter booking
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(flightsByDate)
                    .slice(0, 5)
                    .map(([dateKey, dateFlights]) => (
                      <div key={dateKey}>
                        <h4 className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
                          {new Date(dateKey).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h4>

                        <div className="space-y-2">
                          {dateFlights.map((flight) => (
                            <Link
                              key={flight.id}
                              href={`/dashboard/counter-booking/${flight.id}`}
                              className={`group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all ${
                                flight.availableSeats === 0
                                  ? "opacity-50 pointer-events-none"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {/* Plane Image */}
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  <img
                                    src={flight.plane.image}
                                    alt={flight.plane.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Flight Info */}
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {flight.plane.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {flight.plane.code}
                                  </p>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-3 ml-4">
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-800">
                                      {formatTime(flight.departureDate)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {flight.departureCityCode}
                                    </p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-brand-500" />
                                  <div className="text-center">
                                    <p className="font-semibold text-gray-800">
                                      {formatTime(flight.arrivalDate)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {flight.destinationCityCode}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Seats & Price */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">From</p>
                                  <p className="font-semibold text-brand-600">
                                    {formatCurrency(
                                      flight.priceEconomy || flight.price
                                    )}
                                  </p>
                                </div>

                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    flight.availableSeats === 0
                                      ? "bg-red-100 text-red-600"
                                      : flight.availableSeats < 5
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {flight.availableSeats} seats
                                </span>

                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentBookings.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentBookings.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-semibold text-brand-600">
                          {ticket.code}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {ticket.paymentMethod?.replace("_", " ") || "CASH"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-800 font-medium">
                          {ticket.passenger?.name || ticket.counterCustomerName}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          Seat {ticket.seat.seatNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>
                          {ticket.flight.departureCityCode} →{" "}
                          {ticket.flight.destinationCityCode}
                        </span>
                        <span>{formatDate(ticket.bookingDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
