import React from "react";
import { getFlightForCounterBooking } from "../lib/data";
import { redirect } from "next/navigation";
import CounterBookingForm from "./components/counter-booking-form";
import { Plane, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import PageHeader from "../../ui/page-header/PageHeader";
import { Card, CardContent } from "../../ui/card/Card";

interface Props {
  params: Promise<{ flightId: string }>;
}

// Helper functions
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export default async function CounterBookingFlightPage({ params }: Props) {
  const { flightId } = await params;
  const flight = await getFlightForCounterBooking(flightId);

  if (!flight) {
    redirect("/dashboard/counter-booking");
  }

  // Check if flight is in the past
  if (new Date(flight.departureDate) < new Date()) {
    redirect("/dashboard/counter-booking?error=Flight has already departed");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counter Booking"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Counter Booking", href: "/dashboard/counter-booking" },
          { label: "Book Ticket" },
        ]}
      />

      {/* Flight Info Card */}
      <Card className="border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50">
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Plane Image */}
              <div className="w-20 h-14 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                <img
                  src={flight.plane.image}
                  alt={flight.plane.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-brand-500" />
                  {flight.plane.name}
                </h2>
                <p className="text-sm text-gray-500">{flight.plane.code}</p>
              </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatTime(flight.departureDate)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                    <MapPin className="w-3 h-3" />
                    {flight.departureCity}
                  </p>
                </div>

                <div className="flex flex-col items-center px-4">
                  <div className="w-20 border-t-2 border-dashed border-brand-300" />
                  <Plane className="w-4 h-4 text-brand-500 my-1 rotate-90" />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatTime(flight.arrivalDate)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-center">
                    <MapPin className="w-3 h-3" />
                    {flight.destinationCity}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="text-right">
              <div className="flex items-center gap-2 text-brand-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatDate(flight.departureDate)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form Component */}
      <CounterBookingForm flight={flight} />
    </div>
  );
}
