"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FlightFiltersProps {
  currentSeatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  airplanes: { id: string; name: string; code: string }[];
  departure?: string;
  arrival?: string;
  date?: string;
}

export default function FlightFilters({
  currentSeatType,
  airplanes,
  departure,
  arrival,
  date,
}: FlightFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create URL with updated params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Handle seat type change
  const handleSeatTypeChange = (
    seatType: "ECONOMY" | "BUSINESS" | "FIRST" | ""
  ) => {
    const queryString = createQueryString("seatType", seatType);
    router.push(`/available-flights?${queryString}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (departure) params.set("departure", departure);
    if (arrival) params.set("arrival", arrival);
    if (date) params.set("date", date);
    router.push(`/available-flights?${params.toString()}`);
  };

  return (
    <form className="ticket-filter flex flex-col shrink-0 w-[230px] gap-[30px] text-flysha-off-purple">
      {/* Seat Class Filter */}
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-white">Seat Class</p>
        <label
          htmlFor="all-seats"
          className={`font-semibold flex items-center gap-[10px] cursor-pointer transition-colors ${
            !currentSeatType ? "text-white" : "hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="seat"
            id="all-seats"
            checked={!currentSeatType}
            onChange={() => handleSeatTypeChange("")}
            className="w-[18px] h-[18px] appearance-none checked:border-[3px] checked:border-solid checked:border-flysha-black rounded-full checked:bg-flysha-light-purple ring-2 ring-flysha-off-purple checked:ring-white cursor-pointer"
          />
          All Classes
        </label>
        <label
          htmlFor="economy"
          className={`font-semibold flex items-center gap-[10px] cursor-pointer transition-colors ${
            currentSeatType === "ECONOMY" ? "text-white" : "hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="seat"
            id="economy"
            checked={currentSeatType === "ECONOMY"}
            onChange={() => handleSeatTypeChange("ECONOMY")}
            className="w-[18px] h-[18px] appearance-none checked:border-[3px] checked:border-solid checked:border-flysha-black rounded-full checked:bg-flysha-light-purple ring-2 ring-flysha-off-purple checked:ring-white cursor-pointer"
          />
          Economy
        </label>
        <label
          htmlFor="business"
          className={`font-semibold flex items-center gap-[10px] cursor-pointer transition-colors ${
            currentSeatType === "BUSINESS" ? "text-white" : "hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="seat"
            id="business"
            checked={currentSeatType === "BUSINESS"}
            onChange={() => handleSeatTypeChange("BUSINESS")}
            className="w-[18px] h-[18px] appearance-none checked:border-[3px] checked:border-solid checked:border-flysha-black rounded-full checked:bg-flysha-light-purple ring-2 ring-flysha-off-purple checked:ring-white cursor-pointer"
          />
          Business
        </label>
        <label
          htmlFor="first"
          className={`font-semibold flex items-center gap-[10px] cursor-pointer transition-colors ${
            currentSeatType === "FIRST" ? "text-white" : "hover:text-white"
          }`}
        >
          <input
            type="radio"
            name="seat"
            id="first"
            checked={currentSeatType === "FIRST"}
            onChange={() => handleSeatTypeChange("FIRST")}
            className="w-[18px] h-[18px] appearance-none checked:border-[3px] checked:border-solid checked:border-flysha-black rounded-full checked:bg-flysha-light-purple ring-2 ring-flysha-off-purple checked:ring-white cursor-pointer"
          />
          First
        </label>
      </div>

      {/* Airlines Info */}
      {airplanes.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-white">Available Airlines</p>
          {airplanes.map((airplane) => (
            <div
              key={airplane.id}
              className="font-semibold flex items-center gap-[10px] text-white"
            >
              <div className="w-[18px] h-[18px] rounded-[6px] bg-flysha-light-purple flex items-center justify-center">
                <span className="text-[10px] text-flysha-black font-bold">
                  ✓
                </span>
              </div>
              {airplane.name}
            </div>
          ))}
        </div>
      )}

      {/* Clear Filters Button */}
      {currentSeatType && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="font-semibold text-flysha-light-purple hover:text-white transition-colors text-left"
        >
          Clear Filters
        </button>
      )}
    </form>
  );
}
