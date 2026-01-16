"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCountries, Country } from "@/hooks/useCountries";
import { ChevronDown, Search, Check } from "lucide-react";

interface Seat {
  id: string;
  seatNumber: string;
  type: string;
}

interface RoundTripPassengerFormProps {
  departureSeats: Seat[];
  returnSeats: Seat[];
  departureFlightId: string;
  returnFlightId: string;
  seatType: string;
}

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr.", description: "Adult Male" },
  { value: "Mrs", label: "Mrs.", description: "Married Female" },
  { value: "Ms", label: "Ms.", description: "Adult Female" },
  { value: "Mstr", label: "Mstr.", description: "Child Male (2-11)" },
  { value: "Miss", label: "Miss", description: "Child Female (2-11)" },
];

export interface PassengerData {
  departureSeatId: string;
  returnSeatId: string;
  departureSeatNumber: string;
  returnSeatNumber: string;
  seatType: string;
  title: string;
  fullName: string;
  nationality: string;
  passport?: string;
  passengerType: "adult" | "child";
}

// Custom Country Select Component
const CountrySelect = ({
  value,
  onChange,
  countries,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  loading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = countries.find((c) => c.name.common === value);

  return (
    <div className="relative isolate" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-flysha-black text-white px-4 py-3 rounded-xl border flex items-center justify-between transition-colors focus:outline-none ${
          isOpen
            ? "border-flysha-light-purple ring-1 ring-flysha-light-purple"
            : "border-white/20 hover:border-flysha-light-purple"
        }`}
      >
        <span
          className={`block truncate mr-2 ${!value ? "text-gray-500" : ""}`}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">
                {selectedCountry.flags.svg ? (
                  <img
                    src={selectedCountry.flags.svg}
                    alt="flag"
                    className="w-5 h-3.5 object-cover rounded-[2px]"
                  />
                ) : (
                  "🏳️"
                )}
              </span>
              <span className="truncate">{selectedCountry.name.common}</span>
            </div>
          ) : (
            value || "Select Nationality"
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+8px)] left-0 w-full border border-white/10 rounded-xl shadow-[0_10px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top"
          style={{
            zIndex: 9999,
            backgroundColor: "#181026",
            isolation: "isolate",
          }}
        >
          <div
            className="p-3 border-b border-white/10 shrink-0"
            style={{ backgroundColor: "#181026" }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple placeholder-gray-500"
                style={{ backgroundColor: "#0D0914" }}
              />
            </div>
          </div>

          <div
            className="max-h-[200px] overflow-y-auto"
            style={{ backgroundColor: "#181026", scrollbarWidth: "none" }}
          >
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Not found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.cca2}
                  type="button"
                  onClick={() => {
                    onChange(country.name.common);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 hover:bg-white/5 ${
                    value === country.name.common
                      ? "bg-flysha-light-purple/20 text-flysha-light-purple"
                      : "text-gray-300"
                  }`}
                >
                  <img
                    src={country.flags.svg}
                    alt={country.name.common}
                    className="w-5 h-3.5 object-cover rounded-[2px] shrink-0 bg-white/10"
                  />
                  <span className="flex-1 truncate text-sm font-medium">
                    {country.name.common}
                  </span>
                  {value === country.name.common && (
                    <Check className="w-4 h-4 text-flysha-light-purple shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoundTripPassengerForm({
  departureSeats,
  returnSeats,
  departureFlightId,
  returnFlightId,
  seatType,
}: RoundTripPassengerFormProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const { countries, loading } = useCountries();

  // Initialize form data - one passenger per seat pair
  useEffect(() => {
    const initialData: PassengerData[] = departureSeats.map((dSeat, index) => ({
      departureSeatId: dSeat.id,
      returnSeatId: returnSeats[index]?.id || "",
      departureSeatNumber: dSeat.seatNumber,
      returnSeatNumber: returnSeats[index]?.seatNumber || "",
      seatType: dSeat.type,
      title: "Mr",
      fullName: "",
      nationality: "Indonesia",
      passport: "",
      passengerType: "adult",
    }));
    setPassengers(initialData);
  }, [departureSeats, returnSeats]);

  const getPassengerTypeFromTitle = (title: string): "adult" | "child" => {
    return title === "Mstr" || title === "Miss" ? "child" : "adult";
  };

  const handleChange = (
    index: number,
    field: keyof PassengerData,
    value: string
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "title") {
      updated[index].passengerType = getPassengerTypeFromTitle(value);
    }

    setPassengers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to Session Storage
    sessionStorage.setItem(
      "round_trip_passenger_data",
      JSON.stringify(passengers)
    );
    sessionStorage.setItem("round_trip_departure_flight_id", departureFlightId);
    sessionStorage.setItem("round_trip_return_flight_id", returnFlightId);

    // Get all seat IDs
    const departureSeatIds = departureSeats.map((s) => s.id).join(",");
    const returnSeatIds = returnSeats.map((s) => s.id).join(",");

    // Redirect to checkout
    router.push(
      `/checkout/round-trip?departureFlightId=${departureFlightId}&returnFlightId=${returnFlightId}&departureSeatIds=${departureSeatIds}&returnSeatIds=${returnSeatIds}&seatType=${seatType}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {passengers.map((passenger, index) => (
        <div
          key={`${passenger.departureSeatId}-${passenger.returnSeatId}`}
          className="bg-flysha-bg-purple p-6 rounded-[20px] border border-white/10 relative"
          style={{ zIndex: (passengers.length - index) * 50 }}
        >
          {/* Header with Seat Assignment */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-flysha-light-purple/20 to-flysha-light-purple/5 border border-flysha-light-purple/30">
                  <span className="text-flysha-light-purple font-bold text-sm">
                    {passenger.departureSeatNumber}
                  </span>
                  <span className="text-[8px] text-flysha-light-purple/70">
                    DEP
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30">
                  <span className="text-green-400 font-bold text-sm">
                    {passenger.returnSeatNumber}
                  </span>
                  <span className="text-[8px] text-green-400/70">RET</span>
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">
                  Passenger {index + 1}
                </h2>
                <p className="text-sm text-flysha-off-purple">
                  {passenger.passengerType === "child" ? "Child" : "Adult"} •{" "}
                  {passenger.seatType} Class
                </p>
              </div>
            </div>
            {passenger.passengerType === "child" && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                Child (2-11 yrs)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div
              className="flex flex-col gap-2 relative"
              style={{ zIndex: 60 }}
            >
              <label
                htmlFor={`title-${index}`}
                className="text-sm text-flysha-off-purple"
              >
                Title
              </label>
              <div className="relative">
                <select
                  id={`title-${index}`}
                  value={passenger.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="w-full bg-flysha-black text-white px-4 py-3 rounded-xl border border-white/20 appearance-none focus:outline-none focus:border-flysha-light-purple cursor-pointer"
                >
                  {TITLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.description})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image
                    src="/assets/images/icons/arrow-down.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-2" style={{ zIndex: 10 }}>
              <label
                htmlFor={`name-${index}`}
                className="text-sm text-flysha-off-purple"
              >
                Full Name
              </label>
              <input
                type="text"
                id={`name-${index}`}
                value={passenger.fullName}
                onChange={(e) =>
                  handleChange(index, "fullName", e.target.value)
                }
                required
                placeholder="As stated in ID/Passport"
                className="w-full bg-flysha-black text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-flysha-light-purple placeholder-gray-600"
              />
            </div>

            {/* Nationality */}
            <div
              className="flex flex-col gap-2 relative"
              style={{ zIndex: 100 }}
            >
              <label className="text-sm text-flysha-off-purple">
                Nationality
              </label>
              <CountrySelect
                value={passenger.nationality}
                onChange={(val) => handleChange(index, "nationality", val)}
                countries={countries}
                loading={loading}
              />
            </div>

            {/* Passport */}
            <div className="flex flex-col gap-2" style={{ zIndex: 10 }}>
              <label
                htmlFor={`pass-${index}`}
                className="text-sm text-flysha-off-purple"
              >
                Passport / ID Number
              </label>
              <input
                type="text"
                id={`pass-${index}`}
                value={passenger.passport}
                onChange={(e) =>
                  handleChange(index, "passport", e.target.value)
                }
                placeholder="Optional"
                className="w-full bg-flysha-black text-white px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-flysha-light-purple placeholder-gray-600"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="mt-4 font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-full transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center font-bold text-lg"
      >
        Continue to Checkout
      </button>
    </form>
  );
}
