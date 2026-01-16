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
  passengers?: number;
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
  passengers = 1,
}: RoundTripFlightListProps) {
  const [selectedDepartureFlightId, setSelectedDepartureFlightId] =
    useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    seatType
  );

  const returnSectionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const handleSelectFlight = (
    flightId: string,
    flightType: "departure" | "return",
    type?: string
  ) => {
    if (flightType === "departure") {
      setSelectedDepartureFlightId(flightId);
      if (type) setSelectedClass(type);

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
  // Calculate price based on selected class if available
  const departurePrice = selectedDepartureFlight
    ? (selectedClass === "BUSINESS"
        ? selectedDepartureFlight.priceBusiness
        : selectedClass === "FIRST"
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
            <span className="font-semibold">
              Select Departure {selectedClass ? `(${selectedClass})` : ""}
            </span>
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
        departureFlights.flatMap((flight) => {
          if (seatType) {
            return [
              <FlightCard
                key={flight.id}
                flight={flight}
                seatType={seatType}
                isRoundTrip={true}
                flightType="departure"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />,
            ];
          }
          // Logic to show multiple cards per flight if 'All' seat type
          const cards = [];
          const hasEconomy = flight.seats.some((s) => s.type === "ECONOMY");
          const hasBusiness = flight.seats.some((s) => s.type === "BUSINESS");
          const hasFirst = flight.seats.some((s) => s.type === "FIRST");

          if (hasEconomy)
            cards.push(
              <FlightCard
                key={`${flight.id}-ECO`}
                flight={flight}
                seatType="ECONOMY"
                isRoundTrip={true}
                flightType="departure"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );
          if (hasBusiness)
            cards.push(
              <FlightCard
                key={`${flight.id}-BUS`}
                flight={flight}
                seatType="BUSINESS"
                isRoundTrip={true}
                flightType="departure"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );
          if (hasFirst)
            cards.push(
              <FlightCard
                key={`${flight.id}-FIRST`}
                flight={flight}
                seatType="FIRST"
                isRoundTrip={true}
                flightType="departure"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );

          if (cards.length === 0)
            cards.push(
              <FlightCard
                key={flight.id}
                flight={flight}
                isRoundTrip={true}
                flightType="departure"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );

          return cards;
        })
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
        {(returnDate || date) && (
          <span className="text-flysha-off-purple text-sm">
            • On or after{" "}
            {new Date(returnDate || date || "").toLocaleDateString("id-ID", {
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
        returnFlights.flatMap((flight) => {
          // IF a class is already selected (from departure), only show return options for that class
          // To prevent mixed class booking issues in current checkout flow
          if (selectedClass) {
            // Check if this flight has the selected class
            const hasClass = flight.seats.some((s) => s.type === selectedClass);
            if (hasClass) {
              return [
                <FlightCard
                  key={`${flight.id}-${selectedClass}`}
                  flight={flight}
                  seatType={selectedClass}
                  isRoundTrip={true}
                  flightType="return"
                  selectedDepartureFlightId={selectedDepartureFlightId}
                  passengers={passengers}
                  onSelectFlight={handleSelectFlight}
                />,
              ];
            }
            return []; // Don't show if class not available
          }

          // If no class selected (should not happen if departure selected, but safe fallback)
          // Or if seats not filtered (only when seatType is "All" and departure not yet selected - but return list is hidden anyway if no dep selected?) No, return list is shown but buttons disabled.
          // If departure NOT selected, we can show All classes for return too?
          // Actually, buttons are disabled if departure not selected.
          // So we can show all classes.

          const cards = [];
          const hasEconomy = flight.seats.some((s) => s.type === "ECONOMY");
          const hasBusiness = flight.seats.some((s) => s.type === "BUSINESS");
          const hasFirst = flight.seats.some((s) => s.type === "FIRST");

          if (hasEconomy)
            cards.push(
              <FlightCard
                key={`${flight.id}-ECO`}
                flight={flight}
                seatType="ECONOMY"
                isRoundTrip={true}
                flightType="return"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );
          if (hasBusiness)
            cards.push(
              <FlightCard
                key={`${flight.id}-BUS`}
                flight={flight}
                seatType="BUSINESS"
                isRoundTrip={true}
                flightType="return"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );
          if (hasFirst)
            cards.push(
              <FlightCard
                key={`${flight.id}-FIRST`}
                flight={flight}
                seatType="FIRST"
                isRoundTrip={true}
                flightType="return"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );

          if (cards.length === 0)
            cards.push(
              <FlightCard
                key={flight.id}
                flight={flight}
                isRoundTrip={true}
                flightType="return"
                selectedDepartureFlightId={selectedDepartureFlightId}
                passengers={passengers}
                onSelectFlight={handleSelectFlight}
              />
            );

          return cards;
        })
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
