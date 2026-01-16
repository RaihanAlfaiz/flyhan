"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toggleSavedFlight } from "@/app/(landingpage)/(home)/wishlist/lib/actions";

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format time
function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

interface FlightCardProps {
  flight: {
    id: string;
    departureCity: string;
    departureCityCode: string;
    destinationCity: string;
    destinationCityCode: string;
    departureDate: Date | string;
    arrivalDate: Date | string;
    price: number;
    priceEconomy?: number;
    priceBusiness?: number;
    priceFirst?: number;
    plane: {
      id: string;
      name: string;
      code: string;
      image: string;
    };
    seats: {
      id: string;
      type: string;
    }[];
  };
  seatType?: string;
  isRoundTrip?: boolean;
  flightType?: "departure" | "return";
  selectedDepartureFlightId?: string;
  passengers?: number;
  onSelectFlight?: (
    flightId: string,
    flightType: "departure" | "return",
    seatType?: string
  ) => void;
  isSaved?: boolean;
}

export default function FlightCard({
  flight,
  seatType,
  isRoundTrip = false,
  flightType = "departure",
  selectedDepartureFlightId,
  passengers = 1,

  onSelectFlight,
  isSaved: initialIsSaved = false,
}: FlightCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    const previous = isSaved;
    setIsSaved(!previous);

    const res = await toggleSavedFlight(flight.id);
    if (res.error) {
      if (res.error === "Unauthorized") {
        router.push("/signin");
      } else {
        // Revert on error
        setIsSaved(previous);
      }
    }
  };

  // Determine display price based on seat type
  let displayPrice = flight.price;
  if (seatType === "ECONOMY")
    displayPrice = flight.priceEconomy || flight.price;
  if (seatType === "BUSINESS")
    displayPrice = flight.priceBusiness || Math.round(flight.price * 1.5);
  if (seatType === "FIRST")
    displayPrice = flight.priceFirst || Math.round(flight.price * 2.5);

  // Determine seat class label
  const seatLabel = seatType
    ? `${seatType.charAt(0)}${seatType.slice(1).toLowerCase()} Class`
    : "Economy Class"; // Default label

  // Handle image URL - check if it's an external URL or local path
  const getImageUrl = () => {
    if (!flight.plane.image) {
      return "/assets/images/thumbnail/airplane-taking-off-sunset-scene-generative-ai 1.png";
    }
    if (flight.plane.image.startsWith("http")) {
      return flight.plane.image;
    }
    if (flight.plane.image.startsWith("/")) {
      return flight.plane.image;
    }
    return `/${flight.plane.image}`;
  };

  // Handle booking for round trip
  const handleBookRoundTrip = () => {
    if (flightType === "departure") {
      // Store departure flight selection and scroll to return flights
      if (onSelectFlight) {
        onSelectFlight(flight.id, "departure", seatType);
      }
    } else if (flightType === "return" && selectedDepartureFlightId) {
      // Navigate to round trip checkout with both flights
      const params = new URLSearchParams();
      params.set("departureFlightId", selectedDepartureFlightId);
      params.set("returnFlightId", flight.id);
      if (seatType) params.set("seatType", seatType);
      params.set("passengers", String(passengers));
      router.push(`/choose-seat/round-trip?${params.toString()}`);
    }
  };

  const isSelected =
    selectedDepartureFlightId === flight.id && flightType === "departure";

  return (
    <div
      className={`ticket-card flex justify-between items-center rounded-[20px] p-5 bg-flysha-bg-purple transition-all ${
        isSelected
          ? "ring-2 ring-flysha-light-purple shadow-[0_0_30px_rgba(184,141,255,0.3)]"
          : ""
      }`}
    >
      {/* Airline Info */}
      <div className="flex gap-4 items-center w-[200px]">
        <div className="flex shrink-0 w-[90px] h-[70px] rounded-[14px] overflow-hidden">
          <img
            src={getImageUrl()}
            className="w-full h-full object-cover"
            alt={flight.plane.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/thumbnail/airplane-taking-off-sunset-scene-generative-ai 1.png";
            }}
          />
        </div>
        <div className="flex flex-col justify-center gap-[2px]">
          <p className="font-bold text-lg">{flight.plane.name}</p>
          <p className="text-sm text-flysha-off-purple">{seatLabel}</p>
        </div>
      </div>

      {/* Flight Times */}
      <div className="flex items-center gap-[30px]">
        <div className="flex flex-col gap-[2px] text-center">
          <p className="font-bold text-lg">
            {formatTime(flight.departureDate)}
          </p>
          <p className="text-sm text-flysha-off-purple">
            {flight.departureCityCode}
          </p>
        </div>
        <Image
          src="/assets/images/icons/plane-dotted.svg"
          alt="flight path"
          width={80}
          height={24}
        />
        <div className="flex flex-col gap-[2px] text-center">
          <p className="font-bold text-lg">{formatTime(flight.arrivalDate)}</p>
          <p className="text-sm text-flysha-off-purple">
            {flight.destinationCityCode}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end w-[150px]">
        <button
          type="button"
          onClick={handleToggleSave}
          className="mb-2 p-1 rounded-full hover:bg-white/10 transition-colors group"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isSaved
                ? "fill-pink-500 text-pink-500"
                : "text-gray-400 group-hover:text-pink-400"
            }`}
          />
        </button>
        <p className="font-bold text-lg text-right">
          {formatCurrency(displayPrice)}
        </p>
        {!seatType && (
          <p className="text-xs text-flysha-off-purple mt-1">Start from</p>
        )}
      </div>

      {/* Book Button */}
      {isRoundTrip ? (
        <button
          onClick={handleBookRoundTrip}
          className={`font-bold rounded-full px-5 py-3 transition-all duration-300 whitespace-nowrap ${
            flightType === "return" && !selectedDepartureFlightId
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-green-500 text-white hover:shadow-[0_10px_20px_0_#22C55E]"
              : flightType === "departure"
              ? "bg-flysha-light-purple text-flysha-black hover:shadow-[0_10px_20px_0_#B88DFF]"
              : "bg-green-500 text-white hover:shadow-[0_10px_20px_0_#22C55E]"
          }`}
          disabled={flightType === "return" && !selectedDepartureFlightId}
        >
          {isSelected
            ? "✓ Selected"
            : flightType === "departure"
            ? "Select Departure"
            : "Complete Booking"}
        </button>
      ) : (
        <Link
          href={`/choose-seat/${flight.id}${
            seatType ? `?seatType=${seatType}` : ""
          }`}
          className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-5 py-3 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] whitespace-nowrap"
        >
          Book Flight
        </Link>
      )}
    </div>
  );
}
