"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { verifyPromoCode, checkoutTicket } from "../lib/actions";
import { PassengerData } from "../../passenger-details/components/passenger-form";

interface CheckoutContentProps {
  flight: any;
  seats: any[];
  user: any;
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
}: CheckoutContentProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load Passengers from Session Storage
  useEffect(() => {
    const stored = sessionStorage.getItem("booking_passenger_data");
    const storedFlightId = sessionStorage.getItem("booking_flight_id");

    if (stored && storedFlightId === flight.id) {
      // Need to filter only confirmed seats? No, assume flow is strict.
      const parsed = JSON.parse(stored);
      setPassengers(parsed);
    } else {
      // Fallback if data missing (direct access) -> Redirect? or Use User Profile
      // For MVP, user profile as passenger 1
      // router.push(`/passenger-details?flightId=${flight.id}&seatIds=${seats.map(s=>s.id).join(',')}`)
      // Let's just create dummy based on logged in user to avoid blocker
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

  const insurancePrice = Math.round(totalSeatPrice * 0.1);
  const taxPrice = Math.round(totalSeatPrice * 0.11);
  const grandTotalBeforeDiscount = totalSeatPrice + insurancePrice + taxPrice;
  const grandTotal = Math.max(0, grandTotalBeforeDiscount - discount);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsVerifying(true);

    // Call Server Action
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
    setIsProcessing(true);

    // Simulating Payment
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

      // Prepare Data for Server Action
      const seatIds = seats.map((s) => s.id);
      const passengerDataForServer = passengers.map((p) => ({
        seatId: p.seatId,
        name: p.fullName,
        passport: p.passport,
      }));

      let promoCodeId = "";
   

      const res = await checkoutTicket(
        flight.id,
        seatIds,
        grandTotal,
        passengerDataForServer,
        undefined 
      );

      if (res.error) {
        Swal.fire("Failed", res.error, "error");
        setIsProcessing(false);
      } else {
        // Clear Session
        sessionStorage.removeItem("booking_passenger_data");
        sessionStorage.removeItem("booking_flight_id");

        Swal.close(); // Close processing modal instantly
        router.push("/success-checkout");
      }
    } else {
      setIsProcessing(false);
    }
  };

  return (
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
                  <span className="text-xs text-gray-400">{p.nationality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col mt-[10px] gap-[30px] flex-1">
        <div className="flex flex-col gap-4">
          <p className="font-semibold">Additional Benefits</p>
          {/* Benefits Cards here... keeping it simple for now, using dummy static content from prev page */}
          <div className="benefit-card flex items-center gap-[14px] p-[14px_20px] ring-1 ring-white rounded-[20px]">
            <div className="w-8 h-8 flex shrink-0">
              <Image
                src="/assets/images/icons/crown-white.svg"
                className="w-8 h-8"
                alt="icon"
                width={32}
                height={32}
              />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="font-bold text-lg">Business First</p>
              <p className="text-flysha-off-purple">{flight.plane.name}</p>
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
  );
}
