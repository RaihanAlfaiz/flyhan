"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { verifyPromoCode } from "../../lib/actions";
import { checkoutRoundTrip } from "../lib/actions"; // We'll need to update this action
import { PassengerData } from "@/app/(landingpage)/(home)/passenger-details/round-trip/components/passenger-form";
import { FlightAddon } from "@prisma/client";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { validateSeatHold } from "../../lib/seat-hold";

interface FlightInfo {
  id: string;
  departureCity: string;
  departureCityCode: string;
  destinationCity: string;
  destinationCityCode: string;
  departureDate: string | Date;
  plane: {
    name: string;
    code: string;
    image: string;
  };
}

interface RoundTripCheckoutContentProps {
  departureFlight: FlightInfo;
  returnFlight: FlightInfo;
  departureSeats: any[];
  returnSeats: any[];
  user: any;
  holdUntil?: string;
  seatType: string;
  discountPercent: number;
  addons: FlightAddon[];
}

// Helper
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export default function RoundTripCheckoutContent({
  departureFlight,
  returnFlight,
  departureSeats,
  returnSeats,
  user,
  holdUntil,
  seatType,
  discountPercent,
  addons,
}: RoundTripCheckoutContentProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Addon type for per-passenger addons
  type PassengerAddon = {
    id: string;
    price: number;
    title: string;
    requestDetail?: string;
  };

  // State for Addons: Now per-passenger (keyed by seatId - both dep and ret)
  const [passengerAddons, setPassengerAddons] = useState<
    Record<string, PassengerAddon[]>
  >({});

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
          router.push(
            `/choose-seat/round-trip?departureFlightId=${departureFlight.id}&returnFlightId=${returnFlight.id}&seatType=${seatType}&passengers=${departureSeats.length}`
          );
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    holdUntil,
    departureFlight.id,
    returnFlight.id,
    router,
    seatType,
    departureSeats.length,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Load Passengers from Session Storage
  useEffect(() => {
    const stored = sessionStorage.getItem("round_trip_passenger_data");
    const storedDepId = sessionStorage.getItem(
      "round_trip_departure_flight_id"
    );

    if (stored && storedDepId === departureFlight.id) {
      const parsed = JSON.parse(stored);
      setPassengers(parsed);
    } else {
      // Fallback dummy data if session storage is missing/mismatch
      // This ideally shouldn't happen in proper flow
      const dummy: PassengerData[] = departureSeats.map((ds, idx) => ({
        departureSeatId: ds.id,
        returnSeatId: returnSeats[idx]?.id || "",
        departureSeatNumber: ds.seatNumber,
        returnSeatNumber: returnSeats[idx]?.seatNumber || "",
        seatType: seatType,
        title: "Mr",
        fullName: user.name,
        nationality: "Indonesia",
        passport: user.passport || "-",
        passengerType: "adult",
      }));
      setPassengers(dummy);
    }
  }, [
    departureFlight.id,
    departureSeats,
    returnSeats,
    seatType,
    user.name,
    user.passport,
  ]);

  // Toggle addon for a specific passenger (seat)
  const togglePassengerAddon = (seatId: string, addon: FlightAddon) => {
    setPassengerAddons((prev) => {
      const currentAddons = prev[seatId] || [];
      const exists = currentAddons.find((a) => a.id === addon.id);

      if (exists) {
        // Remove addon
        return {
          ...prev,
          [seatId]: currentAddons.filter((a) => a.id !== addon.id),
        };
      } else {
        // Add addon
        return {
          ...prev,
          [seatId]: [
            ...currentAddons,
            {
              id: addon.id,
              price: addon.price,
              title: addon.title,
              requestDetail: "",
            },
          ],
        };
      }
    });
  };

  // Update addon request detail
  const updatePassengerAddonRequest = (
    seatId: string,
    addonId: string,
    detail: string
  ) => {
    setPassengerAddons((prev) => ({
      ...prev,
      [seatId]: (prev[seatId] || []).map((a) =>
        a.id === addonId ? { ...a, requestDetail: detail } : a
      ),
    }));
  };

  // Check if addon is selected
  const isAddonSelectedForPassenger = (seatId: string, addonId: string) => {
    return (passengerAddons[seatId] || []).some((a) => a.id === addonId);
  };

  // Get addon request detail
  const getAddonRequestDetail = (seatId: string, addonId: string) => {
    return (
      (passengerAddons[seatId] || []).find((a) => a.id === addonId)
        ?.requestDetail || ""
    );
  };

  // Pricing Calculation
  const getSeatPrice = (flight: any, seat: any) => {
    if (seat.type === "BUSINESS") {
      return (
        (flight as any).priceBusiness || Math.round(Number(flight.price) * 1.5)
      );
    } else if (seat.type === "FIRST") {
      return (
        (flight as any).priceFirst || Math.round(Number(flight.price) * 2.5)
      );
    }
    return (flight as any).priceEconomy || flight.price;
  };

  let totalDeparturePrice = 0;
  departureSeats.forEach(
    (seat) => (totalDeparturePrice += getSeatPrice(departureFlight, seat))
  );

  let totalReturnPrice = 0;
  returnSeats.forEach(
    (seat) => (totalReturnPrice += getSeatPrice(returnFlight, seat))
  );

  // Calculate total addon price
  const totalAddonPrice = Object.values(passengerAddons).reduce(
    (total, addons) =>
      total + addons.reduce((sum, addon) => sum + addon.price, 0),
    0
  );

  // Calculate total addon count
  const totalAddonCount = Object.values(passengerAddons).reduce(
    (total, addons) => total + addons.length,
    0
  );

  const subtotal = totalDeparturePrice + totalReturnPrice;
  const roundTripDiscountAmount = Math.floor(
    (subtotal * discountPercent) / 100
  );
  const totalAfterRoundTripDiscount = subtotal - roundTripDiscountAmount;

  const insurancePrice = Math.round(totalAfterRoundTripDiscount * 0.1);
  const taxPrice = Math.round(totalAfterRoundTripDiscount * 0.11);

  const grandTotalBeforePromo =
    totalAfterRoundTripDiscount + totalAddonPrice + insurancePrice + taxPrice;
  const grandTotal = Math.max(0, grandTotalBeforePromo - promoDiscount);

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
      setPromoDiscount(0);
      setAppliedPromo("");
    } else {
      Swal.fire({
        icon: "success",
        title: "Promo Applied!",
        text: `You saved ${formatCurrency(res.discount || 0)}`,
        timer: 1500,
        showConfirmButton: false,
      });
      setPromoDiscount(res.discount || 0);
      setAppliedPromo(promoCode);
    }
  };

  const handleCheckout = async () => {
    if (isExpired) {
      Swal.fire({
        icon: "warning",
        title: "Reservation Expired",
        text: "Your seat reservation has expired. Please select your seats again.",
        confirmButtonColor: "#8B5CF6",
      }).then(() => {
        router.push(
          `/choose-seat/round-trip?departureFlightId=${departureFlight.id}&returnFlightId=${returnFlight.id}&seatType=${seatType}&passengers=${departureSeats.length}`
        );
      });
      return;
    }

    setIsProcessing(true);

    // Validate seats match selected passenger count
    if (
      departureSeats.length !== passengers.length ||
      returnSeats.length !== passengers.length
    ) {
      Swal.fire(
        "Error",
        "Mismatch in passenger count. Please restart booking.",
        "error"
      );
      setIsProcessing(false);
      return;
    }

    // Confirm Payment
    const result = await Swal.fire({
      title: "Confirm Payment",
      html: `
        <div class="text-left text-sm">
            <p>Total: <b>${formatCurrency(grandTotal)}</b></p>
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

      const passengersForServer = passengers.map((p) => ({
        departureSeatId: p.departureSeatId,
        returnSeatId: p.returnSeatId,
        name: p.fullName,
        passport: p.passport,
        title: p.title,
        nationality: p.nationality,
      }));

      // Flatten per-passenger addons for server
      const addonsForServer = Object.entries(passengerAddons).flatMap(
        ([seatId, addons]) =>
          addons.map((a) => ({
            seatId,
            addonId: a.id,
            requestDetail: a.requestDetail || "",
          }))
      );

      // NOTE: We need to ensure logic handles creating tickets for BOTH flights
      // Sending data to server action
      const res = await checkoutRoundTrip({
        departureFlightId: departureFlight.id,
        returnFlightId: returnFlight.id,
        departureSeatIds: departureSeats.map((s) => s.id).join(","),
        returnSeatIds: returnSeats.map((s) => s.id).join(","),
        seatType: seatType as "ECONOMY" | "BUSINESS" | "FIRST",
        totalPrice: grandTotal,
        passengers: passengersForServer,
        addons: addonsForServer, // Pass addons
      });

      if (res.error) {
        Swal.fire("Failed", res.error, "error");
        setIsProcessing(false);
      } else {
        sessionStorage.removeItem("round_trip_passenger_data");
        sessionStorage.removeItem("round_trip_departure_flight_id");

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
        {/* LEFT COLUMN - FLIGHT INFO */}
        <div className="flex flex-col gap-6 w-full max-w-[400px]">
          {/* Departure Flight Card */}
          <div className="bg-white flex flex-col rounded-[20px] text-flysha-black shadow-lg">
            <div className="flex items-center gap-2 px-5 pt-4">
              <span className="bg-flysha-light-purple/20 text-flysha-dark-purple px-2 py-0.5 rounded text-xs font-semibold">
                ✈️ Departure
              </span>
            </div>
            <div className="flex flex-col p-[10px_20px_20px] border-b-2 border-dotted border-gray-200 gap-4 relative">
              <div className="flex w-full h-[150px] shrink-0 rounded-[14px] overflow-hidden bg-[#EDE8F5]">
                <img
                  src={departureFlight.plane.image}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-[2px]">
                  <p className="font-bold text-lg text-gray-900">
                    {departureFlight.plane.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {departureFlight.plane.code} • {seatType} Class
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">
                  {new Date(departureFlight.departureDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold">
                  {departureFlight.departureCityCode} -{" "}
                  {departureFlight.destinationCityCode}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Seats</span>
                <span className="font-semibold">
                  {departureSeats.map((s) => s.seatNumber).join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Return Flight Card */}
          <div className="bg-white flex flex-col rounded-[20px] text-flysha-black shadow-lg">
            <div className="flex items-center gap-2 px-5 pt-4">
              <span className="bg-green-500/20 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                🔄 Return
              </span>
            </div>
            <div className="flex flex-col p-[10px_20px_20px] border-b-2 border-dotted border-gray-200 gap-4 relative">
              <div className="flex w-full h-[150px] shrink-0 rounded-[14px] overflow-hidden bg-[#EDE8F5]">
                <img
                  src={returnFlight.plane.image}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-[2px]">
                  <p className="font-bold text-lg text-gray-900">
                    {returnFlight.plane.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {returnFlight.plane.code} • {seatType} Class
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">
                  {new Date(returnFlight.departureDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold">
                  {returnFlight.departureCityCode} -{" "}
                  {returnFlight.destinationCityCode}
                </span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span className="text-gray-500">Seats</span>
                <span className="font-semibold">
                  {returnSeats.map((s) => s.seatNumber).join(", ")}
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
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-flysha-light-purple/20 flex items-center justify-center text-flysha-dark-purple font-bold text-xs">
                      {p.departureSeatNumber}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-700 font-bold text-xs">
                      {p.returnSeatNumber}
                    </div>
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

        {/* RIGHT COLUMN - PAYMENT */}
        <div className="flex flex-col mt-[10px] gap-[30px] flex-1">
          {/* Additional Services Section */}
          <div className="flex flex-col gap-4">
            <p className="font-semibold">Additional Services</p>

            {/* Departure Services */}
            <div className="bg-flysha-bg-purple/50 rounded-[20px] p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold bg-flysha-light-purple/20 text-flysha-light-purple px-2 py-0.5 rounded">
                  DEPARTURE
                </span>
                <span className="text-sm font-medium">
                  {departureFlight.departureCityCode} →{" "}
                  {departureFlight.destinationCityCode}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {passengers.map((p, idx) => (
                  <div key={`dep-${idx}`} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-flysha-light-purple/20 flex items-center justify-center text-flysha-light-purple font-bold text-xs">
                        {p.departureSeatNumber}
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {p.fullName}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pl-8">
                      {addons.map((addon) => {
                        const isSelected = isAddonSelectedForPassenger(
                          p.departureSeatId,
                          addon.id
                        );
                        return (
                          <div
                            key={addon.id}
                            className={`flex flex-col p-2 rounded-lg transition-all ${
                              isSelected
                                ? "bg-flysha-light-purple/10 ring-1 ring-flysha-light-purple"
                                : "bg-flysha-black/30 hover:bg-flysha-black/50"
                            }`}
                          >
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() =>
                                togglePassengerAddon(p.departureSeatId, addon)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isSelected
                                      ? "bg-flysha-light-purple border-flysha-light-purple"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 text-flysha-black" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">
                                    {addon.title}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {addon.description}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-flysha-light-purple">
                                {formatCurrency(addon.price)}
                              </span>
                            </div>
                            {isSelected && (
                              <input
                                type="text"
                                placeholder="Notes..."
                                className="mt-2 w-full bg-transparent border-b border-white/10 text-xs px-1 py-1 focus:outline-none focus:border-flysha-light-purple"
                                value={getAddonRequestDetail(
                                  p.departureSeatId,
                                  addon.id
                                )}
                                onChange={(e) =>
                                  updatePassengerAddonRequest(
                                    p.departureSeatId,
                                    addon.id,
                                    e.target.value
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Services */}
            <div className="bg-flysha-bg-purple/50 rounded-[20px] p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                  RETURN
                </span>
                <span className="text-sm font-medium">
                  {returnFlight.departureCityCode} →{" "}
                  {returnFlight.destinationCityCode}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {passengers.map((p, idx) => (
                  <div key={`ret-${idx}`} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                        {p.returnSeatNumber}
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {p.fullName}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pl-8">
                      {addons.map((addon) => {
                        const isSelected = isAddonSelectedForPassenger(
                          p.returnSeatId,
                          addon.id
                        );
                        return (
                          <div
                            key={addon.id}
                            className={`flex flex-col p-2 rounded-lg transition-all ${
                              isSelected
                                ? "bg-green-500/10 ring-1 ring-green-500"
                                : "bg-flysha-black/30 hover:bg-flysha-black/50"
                            }`}
                          >
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() =>
                                togglePassengerAddon(p.returnSeatId, addon)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isSelected
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 text-flysha-black" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium">
                                    {addon.title}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {addon.description}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-green-500">
                                {formatCurrency(addon.price)}
                              </span>
                            </div>
                            {isSelected && (
                              <input
                                type="text"
                                placeholder="Notes..."
                                className="mt-2 w-full bg-transparent border-b border-white/10 text-xs px-1 py-1 focus:outline-none focus:border-flysha-light-purple"
                                value={getAddonRequestDetail(
                                  p.returnSeatId,
                                  addon.id
                                )}
                                onChange={(e) =>
                                  updatePassengerAddonRequest(
                                    p.returnSeatId,
                                    addon.id,
                                    e.target.value
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                    setPromoDiscount(0);
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
                Promo applied! Discount: {formatCurrency(promoDiscount)}
              </p>
            )}
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-[18px]">
            <p className="font-semibold">Payment Details</p>

            <div className="flex justify-between">
              <span>Departure ({departureSeats.length} pax)</span>
              <span className="font-semibold">
                {formatCurrency(totalDeparturePrice)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Return ({returnSeats.length} pax)</span>
              <span className="font-semibold">
                {formatCurrency(totalReturnPrice)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {totalAddonPrice > 0 && (
              <div className="flex justify-between">
                <span>Add-ons ({totalAddonCount})</span>
                <span className="font-semibold text-white">
                  {formatCurrency(totalAddonPrice)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-green-400">
              <span>Round Trip Details ({discountPercent}%)</span>
              <span className="font-semibold">
                {" "}
                - {formatCurrency(roundTripDiscountAmount)}
              </span>
            </div>

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
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Promo Discount</span>
                <span className="font-semibold">
                  - {formatCurrency(promoDiscount)}
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
