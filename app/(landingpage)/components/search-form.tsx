"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Users, Minus, Plus } from "lucide-react";

interface SearchFormProps {
  cities: { city: string; code: string }[];
}

// Custom Dropdown Component
const CustomDropdown = ({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { city: string; code: string }[];
  icon: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCity = options.find((c) => c.code === value)?.city || "Select";

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

  return (
    <div className="flex flex-col justify-center gap-[10px]">
      {label && <label className="text-sm text-gray-500">{label}</label>}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <div className="flex items-center w-6 h-6 shrink-0">{icon}</div>
          <span className="font-semibold text-lg">{selectedCity}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-3 w-64 max-h-[240px] overflow-y-auto bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50">
            {options.map((city) => (
              <button
                key={city.code}
                type="button"
                onClick={() => {
                  onChange(city.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                  value === city.code
                    ? "bg-flysha-light-purple/10 text-flysha-light-purple"
                    : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    value === city.code
                      ? "bg-flysha-light-purple text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {city.code}
                </span>
                <span className="font-semibold">{city.city}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Date Picker Component
const CustomDatePicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateDisabled = (date: Date) => date < today;
  const isSelectedDate = (date: Date) => value === formatDateValue(date);
  const isToday = (date: Date) =>
    formatDateValue(date) === formatDateValue(today);

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="flex flex-col justify-center gap-[10px]">
      {label && <label className="text-sm text-gray-500">{label}</label>}
      <div className="relative" ref={datePickerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <div className="flex items-center w-6 h-6 shrink-0">
            <Image
              src="/assets/images/icons/calendar.svg"
              alt="icon"
              width={24}
              height={24}
            />
          </div>
          <span className="font-semibold text-lg">
            {formatDisplayDate(value)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-5"
            style={{ width: "320px" }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="font-bold text-lg">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Week Days Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#9ca3af",
                    padding: "8px 0",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
              }}
            >
              {days.map((date, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {date ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDateDisabled(date)) {
                          onChange(formatDateValue(date));
                          setIsOpen(false);
                        }
                      }}
                      disabled={isDateDisabled(date)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight:
                          isSelectedDate(date) || isToday(date) ? "600" : "400",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        backgroundColor: isSelectedDate(date)
                          ? "#B88DFF"
                          : isToday(date)
                          ? "rgba(184, 141, 255, 0.2)"
                          : "transparent",
                        color: isSelectedDate(date)
                          ? "#ffffff"
                          : isDateDisabled(date)
                          ? "#d1d5db"
                          : isToday(date)
                          ? "#8B5CF6"
                          : "#374151",
                        cursor: isDateDisabled(date)
                          ? "not-allowed"
                          : "pointer",
                        border: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isDateDisabled(date) && !isSelectedDate(date)) {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelectedDate(date)) {
                          e.currentTarget.style.backgroundColor = isToday(date)
                            ? "rgba(184, 141, 255, 0.2)"
                            : "transparent";
                        }
                      }}
                    >
                      {date.getDate()}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Passenger Counter Component
const PassengerCounter = ({
  adults,
  children,
  onAdultsChange,
  onChildrenChange,
}: {
  adults: number;
  children: number;
  onAdultsChange: (val: number) => void;
  onChildrenChange: (val: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalPassengers = adults + children;

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <div className="flex items-center w-6 h-6 shrink-0">
          <Users className="w-6 h-6 text-flysha-light-purple" />
        </div>
        <span className="font-semibold text-lg">
          {totalPassengers} {totalPassengers === 1 ? "Guest" : "Guests"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-5">
          {/* Adults */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-800">Adults</p>
              <p className="text-sm text-gray-500">Age 12+</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-6 text-center">
                {adults}
              </span>
              <button
                type="button"
                onClick={() => onAdultsChange(Math.min(9, adults + 1))}
                disabled={adults >= 9}
                className="w-8 h-8 rounded-full bg-flysha-light-purple text-white flex items-center justify-center hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Children</p>
              <p className="text-sm text-gray-500">Age 2-11</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChildrenChange(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-6 text-center">
                {children}
              </span>
              <button
                type="button"
                onClick={() => onChildrenChange(Math.min(9, children + 1))}
                disabled={children >= 9}
                className="w-8 h-8 rounded-full bg-flysha-light-purple text-white flex items-center justify-center hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 rounded-xl bg-flysha-light-purple text-flysha-black font-bold hover:opacity-90 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Seat Class Dropdown
const SeatClassDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: "", label: "Any Class" },
    { value: "ECONOMY", label: "Economy" },
    { value: "BUSINESS", label: "Business" },
    { value: "FIRST", label: "First Class" },
  ];

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Any Class";

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <div className="flex items-center w-6 h-6 shrink-0">
          <Image
            src="/assets/images/icons/crown.svg"
            alt="class"
            width={24}
            height={24}
          />
        </div>
        <span className="font-semibold text-lg">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                value === option.value
                  ? "bg-flysha-light-purple/10 text-flysha-light-purple"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SearchForm({ cities }: SearchFormProps) {
  const router = useRouter();
  const [departure, setDeparture] = useState(cities[0]?.code || "");
  const [arrival, setArrival] = useState(
    cities[1]?.code || cities[0]?.code || ""
  );
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [seatClass, setSeatClass] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (departure) params.set("departure", departure);
    if (arrival) params.set("arrival", arrival);
    if (date) params.set("date", date);

    const totalPassengers = adults + children;
    params.set("passengers", totalPassengers.toString());

    if (seatClass) params.set("seatType", seatClass);

    router.push(`/available-flights?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-flysha-black w-full rounded-[20px] p-6"
    >
      {/* Fields Row */}
      <div className="flex items-center justify-between gap-6 mb-5">
        {/* Departure */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm text-gray-500">Departure</span>
          <CustomDropdown
            label=""
            value={departure}
            onChange={setDeparture}
            options={cities}
            icon={
              <Image
                src="/assets/images/icons/airplane.svg"
                alt="icon"
                width={24}
                height={24}
              />
            }
          />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* Arrival */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm text-gray-500">Arrival</span>
          <CustomDropdown
            label=""
            value={arrival}
            onChange={setArrival}
            options={cities}
            icon={
              <Image
                src="/assets/images/icons/airplane.svg"
                alt="icon"
                width={24}
                height={24}
              />
            }
          />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* Date */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm text-gray-500">Departure Date</span>
          <CustomDatePicker label="" value={date} onChange={setDate} />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* Passengers */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm text-gray-500">Passengers</span>
          <PassengerCounter
            adults={adults}
            children={children}
            onAdultsChange={setAdults}
            onChildrenChange={setChildren}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* Class */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-sm text-gray-500">Seat Class</span>
          <SeatClassDropdown value={seatClass} onChange={setSeatClass} />
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gray-200 mb-5" />

      {/* Button Row */}
      <button
        type="submit"
        className="w-full font-bold text-lg text-flysha-black bg-flysha-light-purple rounded-full py-4 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
      >
        Explore Now
      </button>
    </form>
  );
}
