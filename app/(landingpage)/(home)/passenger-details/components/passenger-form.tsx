"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

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

export default function PassengerForm({ seats, flightId }: PassengerFormProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);

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
      nationality: "Indonesia",
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
          className="bg-flysha-bg-purple p-6 rounded-[20px] border border-white/10"
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
            <div className="flex flex-col gap-2">
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
                  className="w-full bg-flysha-black text-white px-4 py-3 rounded-xl border border-white/20 appearance-none focus:outline-none focus:border-flysha-light-purple"
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
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`nat-${index}`}
                className="text-sm text-flysha-off-purple"
              >
                Nationality
              </label>
              <select
                id={`nat-${index}`}
                value={passenger.nationality}
                onChange={(e) =>
                  handleChange(index, "nationality", e.target.value)
                }
                className="w-full bg-flysha-black text-white px-4 py-3 rounded-xl border border-white/20 appearance-none focus:outline-none focus:border-flysha-light-purple"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Japan">Japan</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Passport (Optional) */}
            <div className="flex flex-col gap-2">
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
        className="mt-4 font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-full transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center"
      >
        Continue to Checkout
      </button>
    </form>
  );
}
