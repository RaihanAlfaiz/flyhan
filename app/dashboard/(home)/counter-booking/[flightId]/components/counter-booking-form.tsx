"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  Banknote,
  Building2,
  Check,
  Loader2,
  User,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { createCounterBooking } from "../../lib/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../ui/card/Card";
import PrintableTickets from "./printable-tickets";

interface Seat {
  id: string;
  seatNumber: string;
  type: "ECONOMY" | "BUSINESS" | "FIRST";
  isBooked: boolean | null;
}

interface Flight {
  id: string;
  price: number;
  priceEconomy: number;
  priceBusiness: number;
  priceFirst: number;
  seats: Seat[];
  plane: {
    name: string;
    code: string;
  };
  departureCity: string;
  destinationCity: string;
  departureCityCode: string;
  destinationCityCode: string;
  departureDate: Date;
}

interface PassengerData {
  seatId: string;
  seatNumber: string;
  seatType: string;
  name: string;
  passport: string;
}

interface Props {
  flight: Flight;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

const paymentMethods = [
  { id: "CASH", label: "Cash", icon: Banknote, color: "green" },
  { id: "DEBIT_CARD", label: "Debit Card", icon: CreditCard, color: "blue" },
  {
    id: "CREDIT_CARD",
    label: "Credit Card",
    icon: CreditCard,
    color: "purple",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: Building2,
    color: "orange",
  },
];

export default function CounterBookingForm({ flight }: Props) {
  const router = useRouter();

  // State
  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTickets, setCreatedTickets] = useState<any[] | null>(null);

  // Group seats by type
  const seatsByType = useMemo(() => {
    const grouped: Record<string, Seat[]> = {
      FIRST: [],
      BUSINESS: [],
      ECONOMY: [],
    };
    flight.seats.forEach((seat) => {
      grouped[seat.type].push(seat);
    });
    return grouped;
  }, [flight.seats]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = flight.seats.find((s) => s.id === seatId);
      if (!seat) return sum;
      if (seat.type === "FIRST") {
        return sum + (flight.priceFirst || Math.round(flight.price * 2.5));
      } else if (seat.type === "BUSINESS") {
        return sum + (flight.priceBusiness || Math.round(flight.price * 1.5));
      } else {
        return sum + (flight.priceEconomy || flight.price);
      }
    }, 0);
  }, [selectedSeats, flight]);

  const toggleSeat = (seatId: string) => {
    const seat = flight.seats.find((s) => s.id === seatId);
    if (!seat || seat.isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const proceedToPassengers = () => {
    if (selectedSeats.length === 0) return;
    const initialPassengers: PassengerData[] = selectedSeats.map((seatId) => {
      const seat = flight.seats.find((s) => s.id === seatId)!;
      return {
        seatId,
        seatNumber: seat.seatNumber,
        seatType: seat.type,
        name: "",
        passport: "",
      };
    });
    setPassengers(initialPassengers);
    setStep(2);
  };

  const updatePassenger = (
    index: number,
    field: keyof PassengerData,
    value: string
  ) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const passengersValid = passengers.every((p) => p.name.trim().length >= 2);

  const handleCheckout = async () => {
    if (!passengersValid) return;
    setIsProcessing(true);
    setError(null);

    const result = await createCounterBooking({
      flightId: flight.id,
      seatIds: selectedSeats,
      passengers: passengers.map((p) => ({
        seatId: p.seatId,
        name: p.name,
        passport: p.passport || undefined,
      })),
      paymentMethod: paymentMethod as any,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      totalPrice,
    });

    setIsProcessing(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success && result.tickets) {
      setCreatedTickets(result.tickets);
      setStep(4);
    }
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    const isBooked = !!seat.isBooked;

    return (
      <button
        key={seat.id}
        onClick={() => toggleSeat(seat.id)}
        disabled={isBooked}
        className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all border-2 ${
          isBooked
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : isSelected
            ? "bg-brand-500 text-white border-brand-600 scale-105 shadow-md"
            : "bg-white hover:bg-brand-50 text-gray-700 border-gray-200 hover:border-brand-300"
        }`}
      >
        {seat.seatNumber}
      </button>
    );
  };

  // SUCCESS STEP
  if (step === 4 && createdTickets) {
    // Prepare tickets with flight info for printing
    const ticketsWithFlight = createdTickets.map((ticket: any) => ({
      ...ticket,
      flight: {
        departureCityCode: flight.departureCityCode,
        destinationCityCode: flight.destinationCityCode,
        departureCity: flight.departureCity,
        destinationCity: flight.destinationCity,
        departureDate: flight.departureDate,
        plane: flight.plane,
      },
    }));

    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Successful!
              </h2>
              <p className="text-gray-500">
                {createdTickets.length} ticket(s) have been booked
              </p>
            </div>

            {/* Ticket Summary */}
            <div className="w-full max-w-lg border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="p-4 bg-brand-50 border-b border-gray-200">
                <p className="text-brand-600 font-semibold text-center">
                  Ticket Details
                </p>
              </div>

              <div className="p-4 space-y-3">
                {createdTickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-mono text-brand-600 font-semibold">
                        {ticket.code}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.passenger?.name} • Seat {ticket.seat.seatNumber}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(Number(ticket.price))}
                    </p>
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-brand-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <PrintableTickets tickets={ticketsWithFlight} />
              <button
                onClick={() => router.push("/dashboard/counter-booking")}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors"
              >
                New Booking
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s
                    ? "bg-brand-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 rounded ${
                    step > s ? "bg-brand-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Seat Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-500" />
                Select Seats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded" />
                  <span className="text-xs text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-brand-500 rounded" />
                  <span className="text-xs text-gray-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded" />
                  <span className="text-xs text-gray-600">Booked</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="space-y-6">
                {Object.entries(seatsByType).map(
                  ([type, seats]) =>
                    seats.length > 0 && (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-3">
                          <h4
                            className={`font-semibold ${
                              type === "FIRST"
                                ? "text-yellow-600"
                                : type === "BUSINESS"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          >
                            {type} Class
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(
                              type === "FIRST"
                                ? flight.priceFirst ||
                                    Math.round(flight.price * 2.5)
                                : type === "BUSINESS"
                                ? flight.priceBusiness ||
                                  Math.round(flight.price * 1.5)
                                : flight.priceEconomy || flight.price
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {seats.map(renderSeat)}
                        </div>
                      </div>
                    )
                )}
              </div>

              <button
                onClick={proceedToPassengers}
                disabled={selectedSeats.length === 0}
                className="w-full mt-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue with {selectedSeats.length} seat(s)
                <ChevronRight className="w-5 h-5" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Passenger Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                Passenger Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div
                    key={passenger.seatId}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-600">
                          {passenger.seatNumber}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Passenger {index + 1} • {passenger.seatType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) =>
                              updatePassenger(index, "name", e.target.value)
                            }
                            placeholder="Enter passenger name"
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Passport / ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={passenger.passport}
                          onChange={(e) =>
                            updatePassenger(index, "passport", e.target.value)
                          }
                          placeholder="Passport number"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Customer Contact (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Name"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!passengersValid}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? "text-brand-600" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isSelected ? "text-brand-700" : "text-gray-600"
                        }`}
                      >
                        {method.label}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Booking ({formatCurrency(totalPrice)})
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Flight */}
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Flight</p>
              <p className="font-semibold text-gray-800">{flight.plane.name}</p>
              <p className="text-sm text-brand-600">
                {flight.departureCityCode} → {flight.destinationCityCode}
              </p>
            </div>

            {/* Selected Seats */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Selected Seats</p>
              {selectedSeats.length === 0 ? (
                <p className="text-gray-400 text-sm">No seats selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatId) => {
                    const seat = flight.seats.find((s) => s.id === seatId);
                    return seat ? (
                      <span
                        key={seatId}
                        className="px-2 py-1 bg-brand-100 text-brand-700 text-sm rounded font-semibold"
                      >
                        {seat.seatNumber}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {selectedSeats.map((seatId) => {
                const seat = flight.seats.find((s) => s.id === seatId);
                if (!seat) return null;
                const price =
                  seat.type === "FIRST"
                    ? flight.priceFirst || Math.round(flight.price * 2.5)
                    : seat.type === "BUSINESS"
                    ? flight.priceBusiness || Math.round(flight.price * 1.5)
                    : flight.priceEconomy || flight.price;
                return (
                  <div
                    key={seatId}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span>
                      Seat {seat.seatNumber} ({seat.type})
                    </span>
                    <span>{formatCurrency(price)}</span>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-xl font-bold text-brand-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Payment Method */}
            {step >= 3 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-semibold text-gray-800">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
