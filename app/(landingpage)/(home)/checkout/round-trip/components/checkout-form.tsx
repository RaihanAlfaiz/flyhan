"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutRoundTrip } from "../lib/actions";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import { User, CreditCard, Plane, Check } from "lucide-react";

interface RoundTripCheckoutFormProps {
  departureFlightId: string;
  returnFlightId: string;
  departureSeats: { id: string; seatNumber: string; type: string }[];
  returnSeats: { id: string; seatNumber: string; type: string }[];
  preselectedDepartureSeatId?: string;
  preselectedReturnSeatId?: string;
  seatType: "ECONOMY" | "BUSINESS" | "FIRST";
  userName: string;
  userPassport: string;
}

export default function RoundTripCheckoutForm({
  departureFlightId,
  returnFlightId,
  departureSeats,
  returnSeats,
  preselectedDepartureSeatId,
  preselectedReturnSeatId,
  seatType,
  userName,
  userPassport,
}: RoundTripCheckoutFormProps) {
  const router = useRouter();
  const [departureSeatId, setDepartureSeatId] = useState(
    preselectedDepartureSeatId || ""
  );
  const [returnSeatId, setReturnSeatId] = useState(
    preselectedReturnSeatId || ""
  );
  const [passengerName, setPassengerName] = useState(userName);
  const [passengerPassport, setPassengerPassport] = useState(userPassport);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!departureSeatId) {
      showError("Missing Seat", "Please select a seat for departure flight");
      return;
    }
    if (!returnSeatId) {
      showError("Missing Seat", "Please select a seat for return flight");
      return;
    }
    if (!passengerName.trim()) {
      showError("Missing Info", "Please enter passenger name");
      return;
    }

    setLoading(true);
    showLoading("Processing your round trip booking...");

    const result = await checkoutRoundTrip({
      departureFlightId,
      returnFlightId,
      departureSeatId,
      returnSeatId,
      seatType,
      passengerName,
      passengerPassport,
    });

    closeLoading();
    setLoading(false);

    if (result.success) {
      await showSuccess(
        "Booking Confirmed! 🎉",
        `Your round trip has been booked. Code: ${result.bookingCode}`
      );
      router.push("/my-tickets");
    } else if (result.error) {
      showError("Booking Failed", result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-flysha-bg-purple rounded-[20px] p-6 space-y-6"
    >
      {/* Passenger Info */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-flysha-light-purple" />
          <h3 className="font-bold">Passenger Info</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-flysha-off-purple mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="w-full bg-flysha-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-flysha-light-purple focus:outline-none"
              placeholder="Enter passenger name"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-flysha-off-purple mb-2">
              Passport Number (Optional)
            </label>
            <input
              type="text"
              value={passengerPassport}
              onChange={(e) => setPassengerPassport(e.target.value)}
              className="w-full bg-flysha-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-flysha-light-purple focus:outline-none"
              placeholder="Enter passport number"
            />
          </div>
        </div>
      </div>

      {/* Departure Seat Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-flysha-light-purple" />
          <h3 className="font-bold">Departure Seat</h3>
        </div>

        {departureSeats.length === 0 ? (
          <p className="text-red-400 text-sm">
            No seats available for departure flight
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departureSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => setDepartureSeatId(seat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  departureSeatId === seat.id
                    ? "bg-flysha-light-purple text-flysha-black"
                    : "bg-flysha-black/50 text-white hover:bg-white/10"
                }`}
              >
                {seat.seatNumber}
                {departureSeatId === seat.id && (
                  <Check className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Return Seat Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-green-400 rotate-180" />
          <h3 className="font-bold">Return Seat</h3>
        </div>

        {returnSeats.length === 0 ? (
          <p className="text-red-400 text-sm">
            No seats available for return flight
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {returnSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => setReturnSeatId(seat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  returnSeatId === seat.id
                    ? "bg-green-500 text-white"
                    : "bg-flysha-black/50 text-white hover:bg-white/10"
                }`}
              >
                {seat.seatNumber}
                {returnSeatId === seat.id && (
                  <Check className="w-3 h-3 inline ml-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !departureSeatId || !returnSeatId}
        className="w-full py-4 rounded-full font-bold text-lg bg-gradient-to-r from-flysha-light-purple to-green-500 text-white hover:shadow-[0_10px_30px_rgba(184,141,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>Processing...</>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Complete Round Trip Booking
          </>
        )}
      </button>

      <p className="text-center text-xs text-flysha-off-purple">
        By clicking above, you agree to our terms and conditions
      </p>
    </form>
  );
}
