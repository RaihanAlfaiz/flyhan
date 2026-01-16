"use client";

import { useState, useRef, useEffect } from "react";
import FlightCard from "./flight-card";
import { useSearchParams } from "next/navigation";

interface Flight {
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
}

interface RoundTripFlightListProps {
  departureFlights: Flight[];
  returnFlights: Flight[];
  seatType?: string;
  departureCity: string;
  arrivalCity: string;
  date?: string;
  returnDate?: string;
  discountPercent: number;
}

export default function RoundTripFlightList({
  departureFlights,
  returnFlights,
  seatType,
  departureCity,
  arrivalCity,
  date,
  returnDate,
  discountPercent,
}: RoundTripFlightListProps) {
  const [selectedDepartureFlightId, setSelectedDepartureFlightId] =
    useState<string>("");
  const returnSectionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const handleSelectFlight = (
    flightId: string,
    flightType: "departure" | "return"
  ) => {
    if (flightType === "departure") {
      setSelectedDepartureFlightId(flightId);
      // Smooth scroll to return flights after selection
      setTimeout(() => {
        returnSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  };

  // Calculate potential savings for selected departure
  const selectedDepartureFlight = departureFlights.find(
    (f) => f.id === selectedDepartureFlightId
  );
  const departurePrice = selectedDepartureFlight
    ? (seatType === "BUSINESS"
        ? selectedDepartureFlight.priceBusiness
        : seatType === "FIRST"
        ? selectedDepartureFlight.priceFirst
        : selectedDepartureFlight.priceEconomy) || selectedDepartureFlight.price
    : 0;

  return (
    <div className="ticket-container flex flex-col w-full gap-6">
      {/* Selection Progress Indicator */}
      <div className="bg-flysha-bg-purple rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              selectedDepartureFlightId
                ? "text-green-400"
                : "text-flysha-light-purple"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                selectedDepartureFlightId
                  ? "bg-green-500 text-white"
                  : "bg-flysha-light-purple text-flysha-black"
              }`}
            >
              {selectedDepartureFlightId ? "✓" : "1"}
            </div>
            <span className="font-semibold">Select Departure</span>
          </div>
          <div className="w-12 h-0.5 bg-white/20" />
          <div
            className={`flex items-center gap-2 ${
              selectedDepartureFlightId
                ? "text-white"
                : "text-flysha-off-purple"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                selectedDepartureFlightId
                  ? "bg-green-500/20 text-green-400 border-2 border-green-500"
                  : "bg-white/10 text-flysha-off-purple"
              }`}
            >
              2
            </div>
            <span className="font-semibold">Select Return</span>
          </div>
        </div>

        {/* Discount Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-flysha-light-purple/20 px-4 py-2 rounded-full">
          <span className="text-2xl">🎉</span>
          <span className="font-bold text-green-400">
            {discountPercent}% OFF
          </span>
          <span className="text-sm text-flysha-off-purple">Round Trip</span>
        </div>
      </div>

      {/* Departure Flights */}
      <div className="flex items-center gap-3 pb-2 border-b border-white/10">
        <span className="bg-flysha-light-purple/20 text-flysha-light-purple px-3 py-1 rounded-full text-sm font-semibold">
          ✈️ Departure
        </span>
        <span className="text-flysha-off-purple text-sm">
          {departureCity} → {arrivalCity}
        </span>
        {date && (
          <span className="text-flysha-off-purple text-sm">
            •{" "}
            {new Date(date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {departureFlights.length > 0 ? (
        departureFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            seatType={seatType}
            isRoundTrip={true}
            flightType="departure"
            selectedDepartureFlightId={selectedDepartureFlightId}
            onSelectFlight={handleSelectFlight}
          />
        ))
      ) : (
        <div className="text-center py-8 text-flysha-off-purple">
          No departure flights found
        </div>
      )}

      {/* Return Flights */}
      <div
        ref={returnSectionRef}
        className="flex items-center gap-3 pb-2 border-b border-white/10 mt-8 pt-8"
      >
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            selectedDepartureFlightId
              ? "bg-green-500/20 text-green-400"
              : "bg-white/10 text-flysha-off-purple"
          }`}
        >
          🔄 Return
        </span>
        <span className="text-flysha-off-purple text-sm">
          {arrivalCity} → {departureCity}
        </span>
        {returnDate && (
          <span className="text-flysha-off-purple text-sm">
            •{" "}
            {new Date(returnDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}

        {!selectedDepartureFlightId && (
          <span className="ml-auto text-sm text-yellow-400">
            ⚠️ Please select a departure flight first
          </span>
        )}
      </div>

      {returnFlights.length > 0 ? (
        returnFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            seatType={seatType}
            isRoundTrip={true}
            flightType="return"
            selectedDepartureFlightId={selectedDepartureFlightId}
            onSelectFlight={handleSelectFlight}
          />
        ))
      ) : (
        <div className="text-center py-8 text-flysha-off-purple">
          No return flights found for the selected date
        </div>
      )}

      <p className="text-center text-sm text-[#A0A0AC] h-fit">
        You&apos;ve reached the end of results.
      </p>
    </div>
  );
}
