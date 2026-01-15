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

interface PassengerFormProps {
  seats: Seat[];
  flightId: string;
}

export interface PassengerData {
  seatId: string;
  seatNumber: string;
  title: string;
  fullName: string;
  nationality: string;
  passport?: string;
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
            className="max-h-[200px] overflow-y-auto no-scrollbar"
            style={{
              backgroundColor: "#181026",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

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

export default function PassengerForm({ seats, flightId }: PassengerFormProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const { countries, loading } = useCountries();

  // Initialize form data
  useEffect(() => {
    // Check if data already exists in sessionStorage (back navigation)
    const stored = sessionStorage.getItem("booking_passenger_data");
    const storedFlightId = sessionStorage.getItem("booking_flight_id");

    if (stored && storedFlightId === flightId) {
      const parsed = JSON.parse(stored);
      // Validate that stored seats match current seats (in case user changed seat selection)
      const seatIds = seats.map((s) => s.id);
      const isSameSeats =
        parsed.length === seats.length &&
        parsed.every((p: PassengerData) => seatIds.includes(p.seatId));

      if (isSameSeats) {
        setPassengers(parsed);
        return;
      }
    }

    // Default Initialization
    const initialData = seats.map((seat) => ({
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      title: "Mr",
      fullName: "",
      nationality: "Indonesia", // Default value
      passport: "",
    }));
    setPassengers(initialData);
  }, [seats, flightId]);

  const handleChange = (
    index: number,
    field: keyof PassengerData,
    value: string
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to Session Storage
    sessionStorage.setItem(
      "booking_passenger_data",
      JSON.stringify(passengers)
    );
    sessionStorage.setItem("booking_flight_id", flightId);

    // Get all seat IDs
    const seatIds = seats.map((s) => s.id).join(",");

    // Redirect to checkout
    router.push(`/checkout?flightId=${flightId}&seatIds=${seatIds}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {passengers.map((passenger, index) => (
        <div
          key={passenger.seatId}
          className="bg-flysha-bg-purple p-6 rounded-[20px] border border-white/10 relative"
          style={{ zIndex: (passengers.length - index) * 50 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">
              Passenger {index + 1}{" "}
              <span className="text-flysha-off-purple text-sm font-normal">
                {" "}
                (Seat {passenger.seatNumber})
              </span>
            </h2>
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
                  <option value="Mr">Mr.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Ms">Ms.</option>
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

            {/* Nationality with API Search */}
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

            {/* Passport (Optional) */}
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
