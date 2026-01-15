"use client";

import {
  PencilIcon,
  Trash2Icon,
  ChevronDown,
  Plane,
  Users,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { deleteFlight, updateFlightStatus } from "../lib/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type {
  Airplane,
  Flight,
  FlightSeat,
  FlightStatus,
} from "@prisma/client";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import Swal from "sweetalert2";

interface FlightWithRelations extends Flight {
  plane: Airplane;
  seats: FlightSeat[];
}

interface FlightCardProps {
  flight: FlightWithRelations;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

const FlightStatusBadge = ({ status }: { status: FlightStatus }) => {
  const config = {
    SCHEDULED: {
      bg: "bg-green-50 dark:bg-green-500/15",
      text: "text-green-600 dark:text-green-500",
      label: "Scheduled",
    },
    DELAYED: {
      bg: "bg-amber-50 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-500",
      label: "Delayed",
    },
    CANCELLED: {
      bg: "bg-red-50 dark:bg-red-500/15",
      text: "text-red-600 dark:text-red-500",
      label: "Cancelled",
    },
  };

  const { bg, text, label } = config[status] || config.SCHEDULED;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {status !== "SCHEDULED" && <AlertCircle className="h-3 w-3" />}
      {label}
    </span>
  );
};

const FlightCard = ({ flight }: FlightCardProps) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const flightStatus = (flight as any).status || "SCHEDULED";

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete("this flight");

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deleteFlight(flight.id);
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  const handleStatusChange = async () => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Flight Status",
      input: "select",
      inputOptions: {
        SCHEDULED: "Scheduled (On Time)",
        DELAYED: "Delayed",
        CANCELLED: "Cancelled",
      },
      inputValue: flightStatus,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#465fff",
      inputValidator: (value) => {
        if (!value) return "Select a status!";
        return null;
      },
    });

    if (newStatus && newStatus !== flightStatus) {
      showLoading("Updating status...");
      const result = await updateFlightStatus(
        flight.id,
        newStatus as FlightStatus
      );
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  const seatsByClass = {
    ECONOMY: flight.seats.filter((s) => s.type === "ECONOMY"),
    BUSINESS: flight.seats.filter((s) => s.type === "BUSINESS"),
    FIRST: flight.seats.filter((s) => s.type === "FIRST"),
  };

  const getAvailableSeats = (type: "ECONOMY" | "BUSINESS" | "FIRST") => {
    const seats = seatsByClass[type];
    const available = seats.filter((s) => !s.isBooked).length;
    return { available, total: seats.length };
  };

  const getTotalAvailableSeats = () => {
    return flight.seats.filter((s) => !s.isBooked).length;
  };

  const getClassPrice = (type: "ECONOMY" | "BUSINESS" | "FIRST") => {
    const f: any = flight;
    switch (type) {
      case "ECONOMY":
        return f.priceEconomy || flight.price;
      case "BUSINESS":
        return f.priceBusiness || Math.round(Number(flight.price) * 1.5);
      case "FIRST":
        return f.priceFirst || Math.round(Number(flight.price) * 2.5);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden dark:bg-white/[0.03] ${
        flightStatus === "CANCELLED"
          ? "border-red-200 dark:border-red-500/30"
          : flightStatus === "DELAYED"
          ? "border-amber-200 dark:border-amber-500/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      {/* Main Card Content */}
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Airplane Info */}
          <div className="flex items-center gap-3 lg:w-52 flex-shrink-0">
            <div className="h-12 w-16 overflow-hidden rounded-lg">
              <img
                src={flight.plane.image}
                alt={flight.plane.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white/90 text-sm line-clamp-1">
                {flight.plane.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {flight.plane.code}
              </span>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                {flight.departureCityCode}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(flight.departureDate)}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-700 relative">
                <Plane className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 text-brand-500" />
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                {flight.destinationCityCode}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(flight.arrivalDate)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="text-center lg:w-24">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(flight.departureDate)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="lg:w-28 text-center">
            <FlightStatusBadge status={flightStatus} />
          </div>

          {/* Price */}
          <div className="lg:w-32 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
            <p className="font-bold text-gray-800 dark:text-white/90">
              Rp {formatPrice(flight.price)}
            </p>
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
              <Users className="h-3 w-3" />
              <span className="text-xs">{getTotalAvailableSeats()} seats</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 lg:w-40 flex-shrink-0">
            <button
              onClick={handleStatusChange}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
            >
              Status
            </button>
            <Link
              href={`/dashboard/flights/${flight.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500 dark:hover:bg-red-500/25"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <span>{showDetails ? "Hide" : "Show"} price details</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-5 pb-5 pt-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["ECONOMY", "BUSINESS", "FIRST"] as const).map((type) => {
              const seats = getAvailableSeats(type);
              const price = getClassPrice(type);

              return (
                <div
                  key={type}
                  className="p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {type.charAt(0) + type.slice(1).toLowerCase()} Class
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                        seats.available > 5
                          ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
                          : seats.available > 0
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-500"
                          : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
                      }`}
                    >
                      {seats.available}/{seats.total}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                    Rp {formatPrice(price)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface FlightListProps {
  flights: FlightWithRelations[];
}

export default function FlightList({ flights }: FlightListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const successMessage = searchParams.get("success");
    if (successMessage) {
      showSuccess("Success", successMessage);
      router.replace("/dashboard/flights");
    }
  }, [searchParams, router]);

  if (flights.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Plane className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Flights Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Click "Add Flight" to create a new flight.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
