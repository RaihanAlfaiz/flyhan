"use client";

import { Button } from "@/components/ui/button";
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
      bg: "bg-[#1cc88a]/10",
      text: "text-[#1cc88a]",
      label: "Scheduled",
    },
    DELAYED: {
      bg: "bg-[#f6c23e]/10",
      text: "text-[#f6c23e]",
      label: "Delayed",
    },
    CANCELLED: {
      bg: "bg-[#e74a3b]/10",
      text: "text-[#e74a3b]",
      label: "Cancelled",
    },
  };

  const { bg, text, label } = config[status] || config.SCHEDULED;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
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
      confirmButtonColor: "#4e73df",
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
      className={`bg-white rounded shadow overflow-hidden border-l-4 ${
        flightStatus === "CANCELLED"
          ? "border-l-[#e74a3b]"
          : flightStatus === "DELAYED"
          ? "border-l-[#f6c23e]"
          : "border-l-[#1cc88a]"
      }`}
    >
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Airplane Info */}
          <div className="flex items-center gap-3 lg:w-52 flex-shrink-0">
            <img
              src={flight.plane.image}
              alt={flight.plane.name}
              className="h-12 w-16 object-cover rounded"
            />
            <div>
              <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                {flight.plane.name}
              </h3>
              <span className="text-xs text-gray-500">{flight.plane.code}</span>
            </div>
          </div>

          {/* Route Info */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">
                {flight.departureCityCode}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(flight.departureDate)}
              </p>
            </div>

            <div className="flex items-center gap-2 px-4">
              <div className="w-2 h-2 rounded-full bg-[#4e73df]" />
              <div className="w-16 h-0.5 bg-gray-300 relative">
                <Plane className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 text-[#4e73df]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#4e73df]" />
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">
                {flight.destinationCityCode}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(flight.arrivalDate)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="text-center lg:w-24">
            <p className="text-xs text-gray-500">
              {formatDate(flight.departureDate)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="lg:w-28 text-center">
            <FlightStatusBadge status={flightStatus} />
          </div>

          {/* Price */}
          <div className="lg:w-32 text-center">
            <p className="text-xs text-gray-500">From</p>
            <p className="font-bold text-gray-800">
              Rp {formatPrice(flight.price)}
            </p>
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span className="text-xs">{getTotalAvailableSeats()} seats</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 lg:w-40 flex-shrink-0">
            <button
              onClick={handleStatusChange}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#36b9cc] hover:bg-[#2a96a5] rounded transition-colors"
            >
              Status
            </button>
            <Link
              href={`/dashboard/flights/${flight.id}/edit`}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-2 py-1.5 text-xs font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
            >
              <Trash2Icon className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["ECONOMY", "BUSINESS", "FIRST"] as const).map((type) => {
              const seats = getAvailableSeats(type);
              const price = getClassPrice(type);

              return (
                <div key={type} className="p-3 rounded border bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {type.charAt(0) + type.slice(1).toLowerCase()} Class
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        seats.available > 5
                          ? "bg-[#1cc88a]/10 text-[#1cc88a]"
                          : seats.available > 0
                          ? "bg-[#f6c23e]/10 text-[#f6c23e]"
                          : "bg-[#e74a3b]/10 text-[#e74a3b]"
                      }`}
                    >
                      {seats.available}/{seats.total}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
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
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Plane className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Flights Yet
        </h3>
        <p className="text-gray-500">
          Click "Add Flight" to create a new flight.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
