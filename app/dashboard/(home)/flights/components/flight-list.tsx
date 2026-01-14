"use client";

import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  Trash2Icon,
  ChevronDown,
  Plane,
  Users,
} from "lucide-react";
import Link from "next/link";
import { deleteFlight } from "../lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Airplane, Flight, FlightSeat } from "@prisma/client";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

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

const FlightCard = ({ flight }: FlightCardProps) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete("penerbangan ini");

    if (confirmed) {
      showLoading("Menghapus data...");
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

  // Calculate seat availability by class
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
    const f: any = flight; // Cast to any until prisma client is fully available
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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Main Card Content */}
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          {/* Airplane Info */}
          <div className="flex items-center gap-4 lg:w-56 flex-shrink-0">
            <div className="relative">
              <img
                src={flight.plane.image}
                alt={flight.plane.name}
                className="h-16 w-20 object-cover rounded-xl shadow-sm"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 line-clamp-2">
                {flight.plane.name}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {flight.plane.code}
              </span>
            </div>
          </div>

          {/* Divider for desktop */}
          <div className="hidden lg:block w-px h-16 bg-gray-200" />

          {/* Route Info */}
          <div className="flex-1 flex items-center justify-center gap-3 py-2">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {flight.departureCityCode}
              </p>
              <p className="text-sm text-gray-600">{flight.departureCity}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(flight.departureDate)}
              </p>
              <p className="text-xs font-medium text-blue-600">
                {formatTime(flight.departureDate)}
              </p>
            </div>

            {/* Flight Path Visual */}
            <div className="flex items-center gap-2 px-4">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="w-16 lg:w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                <Plane className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 text-purple-500" />
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {flight.destinationCityCode}
              </p>
              <p className="text-sm text-gray-600">{flight.destinationCity}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(flight.arrivalDate)}
              </p>
              <p className="text-xs font-medium text-purple-600">
                {formatTime(flight.arrivalDate)}
              </p>
            </div>
          </div>

          {/* Divider for desktop */}
          <div className="hidden lg:block w-px h-16 bg-gray-200" />

          {/* Price & Seats Summary */}
          <div className="lg:w-44 flex-shrink-0 text-center lg:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Mulai dari
            </p>
            <p className="text-xl font-bold text-emerald-600">
              Rp {formatPrice(flight.price)}
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-1 mt-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span className="text-xs">
                {getTotalAvailableSeats()} kursi tersedia
              </span>
            </div>
          </div>

          {/* Divider for desktop */}
          <div className="hidden lg:block w-px h-16 bg-gray-200" />

          {/* Actions */}
          <div className="flex items-center justify-center gap-2 lg:w-32 flex-shrink-0">
            <Button
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Link href={`/dashboard/flights/${flight.id}/edit`}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="shadow-sm"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>
            {showDetails ? "Sembunyikan" : "Lihat"} detail harga & kursi
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["ECONOMY", "BUSINESS", "FIRST"] as const).map((type) => {
              const seats = getAvailableSeats(type);
              const price = getClassPrice(type);
              const colorClass =
                type === "ECONOMY"
                  ? "from-emerald-500 to-teal-500"
                  : type === "BUSINESS"
                  ? "from-blue-500 to-indigo-500"
                  : "from-amber-500 to-orange-500";
              const bgClass =
                type === "ECONOMY"
                  ? "bg-emerald-50 border-emerald-200"
                  : type === "BUSINESS"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-amber-50 border-amber-200";

              return (
                <div key={type} className={`p-4 rounded-xl border ${bgClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-semibold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()} Class
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        seats.available > 5
                          ? "bg-green-100 text-green-700"
                          : seats.available > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {seats.available}/{seats.total} kursi
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
  if (flights.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Plane className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Belum Ada Penerbangan
        </h3>
        <p className="text-gray-500">
          Klik "Tambah Data" untuk menambahkan penerbangan baru.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
