"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { verifyPromoCode, checkoutTicket } from "../lib/actions";
import { PassengerData } from "../../passenger-details/components/passenger-form";
import { FlightAddon } from "@prisma/client";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { releaseSeats, validateSeatHold } from "../lib/seat-hold";

interface CheckoutContentProps {
  flight: any;
  seats: any[];
  user: any;
  addons: FlightAddon[];
  holdUntil?: string; // ISO date string
}

// Helper
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export default function CheckoutContent({
  flight,
  seats,
  user,
  addons,
  holdUntil,
}: CheckoutContentProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Initialize countdown timer
  useEffect(() => {
    if (!holdUntil) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(holdUntil).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      return diff;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(timer);

        // Show expiration alert and redirect
        Swal.fire({
          icon: "warning",
          title: "Reservation Expired",
          text: "Your seat reservation has expired. Please select your seats again.",
          confirmButtonColor: "#8B5CF6",
        }).then(() => {
          router.push(`/choose-seat/${flight.id}`);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdUntil, flight.id, router]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // State for Addons: Storing ID, Price, and optional Request Detail
  const [selectedAddons, setSelectedAddons] = useState<
    { id: string; price: number; title: string; requestDetail?: string }[]
  >([]);

  // Load Passengers from Session Storage
  useEffect(() => {
    const stored = sessionStorage.getItem("booking_passenger_data");
    const storedFlightId = sessionStorage.getItem("booking_flight_id");

    if (stored && storedFlightId === flight.id) {
      const parsed = JSON.parse(stored);
      setPassengers(parsed);
    } else {
      const dummy: PassengerData[] = seats.map((s) => ({
        seatId: s.id,
        seatNumber: s.seatNumber,
        title: "Mr",
        fullName: user.name,
        nationality: "Indonesia",
        passport: user.passport || "-",
      }));
      setPassengers(dummy);
    }
  }, [flight.id, seats, user.name, user.passport]);

  // Pricing Calculation
  let totalSeatPrice = 0;
  seats.forEach((seat) => {
    if (seat.type === "BUSINESS") {
      totalSeatPrice +=
        (flight as any).priceBusiness || Math.round(Number(flight.price) * 1.5);
    } else if (seat.type === "FIRST") {
      totalSeatPrice +=
        (flight as any).priceFirst || Math.round(Number(flight.price) * 2.5);
    } else {
      totalSeatPrice += (flight as any).priceEconomy || flight.price;
    }
  });

  // Calculate Addon Price total (Addon Price * Number of Seats)
  const totalAddonPrice =
    selectedAddons.reduce((acc, curr) => acc + curr.price, 0) * seats.length;

  const insurancePrice = Math.round(totalSeatPrice * 0.1);
  const taxPrice = Math.round(totalSeatPrice * 0.11);
  const grandTotalBeforeDiscount =
    totalSeatPrice + totalAddonPrice + insurancePrice + taxPrice;
  const grandTotal = Math.max(0, grandTotalBeforeDiscount - discount);

  // Toggle Logic
  const toggleAddon = (addon: FlightAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [
          ...prev,
          {
            id: addon.id,
            price: addon.price,
            title: addon.title,
            requestDetail: "",
          },
        ];
      }
    });
  };

  const updateAddonRequest = (id: string, detail: string) => {
    setSelectedAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, requestDetail: detail } : a))
    );
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsVerifying(true);

    const res = await verifyPromoCode(promoCode);

    setIsVerifying(false);

    if (res.error) {
      Swal.fire({
        icon: "error",
        title: "Invalid Code",
        text: res.error,
        confirmButtonColor: "#d33",
      });
      setDiscount(0);
      setAppliedPromo("");
    } else {
      Swal.fire({
        icon: "success",
        title: "Promo Applied!",
        text: `You saved ${formatCurrency(res.discount || 0)}`,
        timer: 1500,
        showConfirmButton: false,
      });
      setDiscount(res.discount || 0);
      setAppliedPromo(promoCode);
    }
  };

  const handleCheckout = async () => {
    // Check if reservation has expired
    if (isExpired) {
      Swal.fire({
        icon: "warning",
        title: "Reservation Expired",
        text: "Your seat reservation has expired. Please select your seats again.",
        confirmButtonColor: "#8B5CF6",
      }).then(() => {
        router.push(`/choose-seat/${flight.id}`);
      });
      return;
    }

    setIsProcessing(true);

    // Validate seat hold before proceeding
    const seatIds = seats.map((s) => s.id);
    const holdValidation = await validateSeatHold(seatIds);

    if (!holdValidation.success) {
      Swal.fire({
        icon: "error",
        title: "Reservation Lost",
        text: holdValidation.message,
        confirmButtonColor: "#d33",
      }).then(() => {
        router.push(`/choose-seat/${flight.id}`);
      });
      setIsProcessing(false);
      return;
    }

    // Confirm Payment
    const result = await Swal.fire({
      title: "Confirm Payment",
      html: `
        <div class="text-left text-sm">
            <p>Total: <b>${formatCurrency(grandTotal)}</b></p>
            <p>Includes ${selectedAddons.length} extra services</p>
            <p>Promo: ${appliedPromo || "-"}</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Pay Now",
      confirmButtonColor: "#5D50C6",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Processing...",
        didOpen: () => Swal.showLoading(),
      });

      const passengerDataForServer = passengers.map((p) => ({
        seatId: p.seatId,
        name: p.fullName,
        passport: p.passport,
      }));

      // Map addons for server
      const addonsForServer = selectedAddons.map((a) => ({
        addonId: a.id,
        requestDetail: a.requestDetail,
      }));

      const res = await checkoutTicket(
        flight.id,
        seatIds,
        grandTotal,
        passengerDataForServer,
        undefined,
        addonsForServer // Pass Addons Here
      );

      if (res.error) {
        Swal.fire("Failed", res.error, "error");
        setIsProcessing(false);
      } else {
        sessionStorage.removeItem("booking_passenger_data");
        sessionStorage.removeItem("booking_flight_id");

        Swal.close();
        router.push("/success-checkout");
      }
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Countdown Timer Banner */}
      {holdUntil && (
        <div
          className={`mb-6 rounded-2xl p-4 flex items-center justify-between ${
            timeLeft <= 60
              ? "bg-red-500/20 border border-red-500/30"
              : timeLeft <= 180
              ? "bg-amber-500/20 border border-amber-500/30"
              : "bg-indigo-500/20 border border-indigo-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {timeLeft <= 60 ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : (
              <Clock className="w-6 h-6 text-indigo-400" />
            )}
            <div>
              <p
                className={`font-semibold ${
                  timeLeft <= 60 ? "text-red-400" : "text-white"
                }`}
              >
                {timeLeft <= 60
                  ? "Hurry! Reservation expiring soon"
                  : "Seat Reservation Timer"}
              </p>
              <p className="text-sm text-gray-400">
                Complete your booking before time runs out
              </p>
            </div>
          </div>
          <div
            className={`text-3xl font-mono font-bold ${
              timeLeft <= 60
                ? "text-red-400 animate-pulse"
                : timeLeft <= 180
                ? "text-amber-400"
                : "text-indigo-400"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <div className="checkout-container flex flex-col lg:flex-row gap-[70px]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 w-full max-w-[400px]">
          {/* Flight Card */}
          <div className="bg-white flex flex-col rounded-[20px] text-flysha-black shadow-lg">
            <div className="flex flex-col p-[20px_20px_25px] border-b-2 border-dotted border-gray-200 gap-4 relative">
              <div className="flex w-full h-[180px] shrink-0 rounded-[14px] overflow-hidden bg-[#EDE8F5]">
                <img
                  src={flight.plane.image}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-[2px]">
                  <p className="font-bold text-lg text-gray-900">
                    {flight.plane.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {flight.plane.code} • {seats[0].type} Class
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">
                  {new Date(flight.departureDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold">
                  {flight.departureCityCode} - {flight.destinationCityCode}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger Summary List */}
          <div className="bg-white rounded-[20px] p-5 text-flysha-black shadow-lg">
            <h3 className="font-bold text-lg mb-4">Passenger List</h3>
            <div className="flex flex-col gap-4">
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-flysha-light-purple/20 flex items-center justify-center text-flysha-dark-purple font-bold text-xs">
                    {p.seatNumber}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {p.title}. {p.fullName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {p.nationality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col mt-[10px] gap-[30px] flex-1">
          {/* Additional Benefits / Flight Addons */}
          <div className="flex flex-col gap-4">
            <p className="font-semibold">Additional Services</p>
            {addons && addons.length > 0 ? (
              addons.map((addon) => {
                const isSelected = selectedAddons.some(
                  (a) => a.id === addon.id
                );
                return (
                  <div
                    key={addon.id}
                    className={`flex flex-col p-4 rounded-[20px] ring-1 transition-all ${
                      isSelected
                        ? "ring-flysha-light-purple bg-flysha-light-purple/10"
                        : "ring-white hover:ring-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => toggleAddon(addon)}
                          className={`w-6 h-6 rounded flex items-center justify-center border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-flysha-light-purple border-flysha-light-purple"
                              : "border-white/50 hover:border-white"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-flysha-black" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{addon.title}</span>
                          <span className="text-sm text-gray-400">
                            {addon.description}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(addon.price)}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pl-10">
                        <input
                          type="text"
                          placeholder="Specify request (e.g. halal meal, pickup location)..."
                          className="w-full bg-flysha-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-flysha-light-purple transition-colors"
                          value={
                            selectedAddons.find((a) => a.id === addon.id)
                              ?.requestDetail || ""
                          }
                          onChange={(e) =>
                            updateAddonRequest(addon.id, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">
                No additional services available.
              </p>
            )}
          </div>

          {/* Promo Code Input */}
          <div className="flex flex-col gap-3">
            <label className="font-semibold">Promo Code</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code here"
                disabled={!!appliedPromo}
                className="flex-1 bg-flysha-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-flysha-light-purple disabled:opacity-50"
              />
              {appliedPromo ? (
                <button
                  onClick={() => {
                    setAppliedPromo("");
                    setDiscount(0);
                    setPromoCode("");
                  }}
                  className="bg-red-500/20 text-red-500 px-6 rounded-xl font-bold border border-red-500/50"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyPromo}
                  disabled={isVerifying || !promoCode}
                  className="bg-flysha-light-purple text-flysha-black px-6 rounded-xl font-bold hover:shadow-[0_10px_20px_0_#B88DFF] transition-all disabled:opacity-50"
                >
                  {isVerifying ? "..." : "Apply"}
                </button>
              )}
            </div>
            {appliedPromo && (
              <p className="text-green-400 text-sm">
                Promo applied! Discount: {formatCurrency(discount)}
              </p>
            )}
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-[18px]">
            <p className="font-semibold">Payment Details</p>
            <div className="flex justify-between">
              <span>Seat Price ({seats.length} seats)</span>
              <span className="font-semibold">
                {formatCurrency(totalSeatPrice)}
              </span>
            </div>
            {totalAddonPrice > 0 && (
              <div className="flex justify-between">
                <span>Add-ons ({selectedAddons.length})</span>
                <span className="font-semibold">
                  {formatCurrency(totalAddonPrice)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insurance 10%</span>
              <span className="font-semibold">
                {formatCurrency(insurancePrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax & Fees 11%</span>
              <span className="font-semibold">{formatCurrency(taxPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span className="font-semibold">
                  - {formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-4 mt-2">
              <span>Grand Total</span>
              <span className="font-bold text-flysha-light-purple text-xl">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-full transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Checkout with Midtrans"}
          </button>
        </div>
      </div>
    </>
  );
}
