"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Plane,
  X,
} from "lucide-react";

interface FlightFiltersProps {
  currentSeatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  airplanes: { id: string; name: string; code: string }[];
  departure?: string;
  arrival?: string;
  date?: string;
  passengers?: string;
  minPrice?: number;
  maxPrice?: number;
}

type SortOption =
  | "price_asc"
  | "price_desc"
  | "departure_asc"
  | "departure_desc"
  | "";
type TimeFilter = "morning" | "afternoon" | "evening" | "night" | "";

export default function FlightFilters({
  currentSeatType,
  airplanes,
  departure,
  arrival,
  date,
  passengers,
  minPrice = 0,
  maxPrice = 10000000,
}: FlightFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentSort = (searchParams.get("sort") as SortOption) || "";
  const currentAirlines =
    searchParams.get("airlines")?.split(",").filter(Boolean) || [];
  const currentTimeFilter = (searchParams.get("time") as TimeFilter) || "";
  const currentMinPrice = parseInt(searchParams.get("minPrice") || "0");
  const currentMaxPrice = parseInt(
    searchParams.get("maxPrice") || maxPrice.toString()
  );

  // Local state for price slider
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [selectedAirlines, setSelectedAirlines] =
    useState<string[]>(currentAirlines);

  // Update local state when URL params change
  useEffect(() => {
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSelectedAirlines(currentAirlines);
  }, [currentMinPrice, currentMaxPrice, searchParams]);

  // Create URL with updated params
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/available-flights?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Handle seat type change
  const handleSeatTypeChange = (
    seatType: "ECONOMY" | "BUSINESS" | "FIRST" | ""
  ) => {
    updateFilters({ seatType });
  };

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    updateFilters({ sort });
  };

  // Handle airline filter change
  const handleAirlineToggle = (airlineCode: string) => {
    const newAirlines = selectedAirlines.includes(airlineCode)
      ? selectedAirlines.filter((a) => a !== airlineCode)
      : [...selectedAirlines, airlineCode];

    setSelectedAirlines(newAirlines);
    updateFilters({ airlines: newAirlines.join(",") });
  };

  // Handle time filter change
  const handleTimeChange = (time: TimeFilter) => {
    updateFilters({ time: time === currentTimeFilter ? "" : time });
  };

  // Handle price range change (debounced apply on mouse up)
  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange];
    newRange[index] = value;
    setPriceRange(newRange);
  };

  const applyPriceRange = () => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (departure) params.set("departure", departure);
    if (arrival) params.set("arrival", arrival);
    if (date) params.set("date", date);
    if (passengers) params.set("passengers", passengers);
    router.push(`/available-flights?${params.toString()}`);
  };

  const hasActiveFilters =
    currentSeatType ||
    currentSort ||
    currentAirlines.length > 0 ||
    currentTimeFilter ||
    currentMinPrice > 0 ||
    currentMaxPrice < maxPrice;

  // Format currency for display
  const formatPrice = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}jt`;
    }
    return `${(amount / 1000).toFixed(0)}rb`;
  };

  return (
    <div className="ticket-filter flex flex-col shrink-0 w-full md:w-[280px] gap-6 text-flysha-off-purple">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-flysha-light-purple" />
          <span className="font-bold text-white text-lg">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-flysha-light-purple hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
        <p className="font-semibold text-white flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Sort By
        </p>
        <div className="flex flex-col gap-2">
          {[
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "departure_asc", label: "Departure: Earliest" },
            { value: "departure_desc", label: "Departure: Latest" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSortChange(option.value as SortOption)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentSort === option.value
                  ? "bg-flysha-light-purple text-flysha-black font-semibold"
                  : "hover:bg-white/10 text-flysha-off-purple hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Class Filter */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
        <p className="font-semibold text-white">Seat Class</p>
        <div className="flex flex-col gap-2">
          {[
            { value: "", label: "All Classes" },
            { value: "ECONOMY", label: "Economy" },
            { value: "BUSINESS", label: "Business" },
            { value: "FIRST", label: "First Class" },
          ].map((option) => (
            <label
              key={option.value}
              className={`font-medium flex items-center gap-3 cursor-pointer transition-colors px-3 py-2 rounded-lg ${
                currentSeatType === option.value ||
                (!currentSeatType && option.value === "")
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="seat"
                checked={
                  currentSeatType === option.value ||
                  (!currentSeatType && option.value === "")
                }
                onChange={() =>
                  handleSeatTypeChange(
                    option.value as "ECONOMY" | "BUSINESS" | "FIRST" | ""
                  )
                }
                className="w-4 h-4 accent-flysha-light-purple"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Filter */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
        <p className="font-semibold text-white">Departure Time</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              value: "morning",
              label: "Morning",
              sublabel: "06:00-12:00",
              icon: <Sun className="w-4 h-4" />,
            },
            {
              value: "afternoon",
              label: "Afternoon",
              sublabel: "12:00-18:00",
              icon: <CloudSun className="w-4 h-4" />,
            },
            {
              value: "evening",
              label: "Evening",
              sublabel: "18:00-22:00",
              icon: <Sunset className="w-4 h-4" />,
            },
            {
              value: "night",
              label: "Night",
              sublabel: "22:00-06:00",
              icon: <Moon className="w-4 h-4" />,
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTimeChange(option.value as TimeFilter)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${
                currentTimeFilter === option.value
                  ? "bg-flysha-light-purple text-flysha-black"
                  : "bg-white/5 hover:bg-white/10 text-flysha-off-purple hover:text-white"
              }`}
            >
              {option.icon}
              <span className="font-semibold">{option.label}</span>
              <span
                className={
                  currentTimeFilter === option.value
                    ? "text-flysha-black/70"
                    : "text-flysha-off-purple/70"
                }
              >
                {option.sublabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
        <p className="font-semibold text-white">Price Range</p>
        <div className="flex flex-col gap-4">
          {/* Range Inputs */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  handlePriceRangeChange(0, parseInt(e.target.value) || 0)
                }
                onBlur={applyPriceRange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-flysha-light-purple focus:outline-none"
                placeholder="Min"
              />
            </div>
            <span className="text-flysha-off-purple">-</span>
            <div className="flex-1">
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  handlePriceRangeChange(1, parseInt(e.target.value) || 0)
                }
                onBlur={applyPriceRange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-flysha-light-purple focus:outline-none"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Visual Range Display */}
          <div className="flex justify-between text-xs text-flysha-off-purple">
            <span>Rp {formatPrice(priceRange[0])}</span>
            <span>Rp {formatPrice(priceRange[1])}</span>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={100000}
            value={priceRange[1]}
            onChange={(e) =>
              handlePriceRangeChange(1, parseInt(e.target.value))
            }
            onMouseUp={applyPriceRange}
            onTouchEnd={applyPriceRange}
            className="w-full accent-flysha-light-purple"
          />
        </div>
      </div>

      {/* Airlines Filter */}
      {airplanes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-white flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Airlines
          </p>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-flysha-light-purple/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-flysha-light-purple/80 transition-colors">
            {airplanes.map((airplane) => (
              <label
                key={airplane.id}
                className={`font-medium flex items-center gap-3 cursor-pointer transition-colors px-3 py-2 rounded-lg ${
                  selectedAirlines.includes(airplane.code)
                    ? "bg-flysha-light-purple/20 text-white"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAirlines.includes(airplane.code)}
                  onChange={() => handleAirlineToggle(airplane.code)}
                  className="w-4 h-4 accent-flysha-light-purple rounded"
                />
                <span className="flex-1 text-sm">{airplane.name}</span>
                <span className="text-xs text-flysha-off-purple">
                  {airplane.code}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
