import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { calculateRoundTripPrice } from "./lib/actions";
import RoundTripCheckoutForm from "./components/checkout-form";
import prisma from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{
    departureFlightId?: string;
    returnFlightId?: string;
    departureSeatId?: string;
    returnSeatId?: string;
    seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  }>;
}

export default async function RoundTripCheckoutPage({
  searchParams,
}: PageProps) {
  const { session, user } = await getUser();

  if (!session) {
    redirect("/signin");
  }

  const params = await searchParams;
  const {
    departureFlightId,
    returnFlightId,
    departureSeatId,
    returnSeatId,
    seatType = "ECONOMY",
  } = params;

  // Validate required params
  if (!departureFlightId || !returnFlightId) {
    redirect("/available-flights?error=Missing+flight+selection");
  }

  // Get pricing calculation
  const pricing = await calculateRoundTripPrice(
    departureFlightId,
    returnFlightId,
    seatType
  );

  if ("error" in pricing) {
    redirect(
      `/available-flights?error=${encodeURIComponent(pricing.error || "Error")}`
    );
  }

  const {
    departureFlight,
    returnFlight,
    departurePrice,
    returnPrice,
    subtotal,
    discountPercent,
    discountAmount,
    totalPrice,
  } = pricing;

  // Get available seats for each flight
  const [departureSeats, returnSeats] = await Promise.all([
    prisma.flightSeat.findMany({
      where: {
        flightId: departureFlightId,
        type: seatType,
        isBooked: false,
      },
      orderBy: { seatNumber: "asc" },
    }),
    prisma.flightSeat.findMany({
      where: {
        flightId: returnFlightId,
        type: seatType,
        isBooked: false,
      },
      orderBy: { seatNumber: "asc" },
    }),
  ]);

  // Get preselected seats if provided
  const preselectedDepartureSeat = departureSeatId
    ? departureSeats.find((s) => s.id === departureSeatId)
    : null;
  const preselectedReturnSeat = returnSeatId
    ? returnSeats.find((s) => s.id === returnSeatId)
    : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen">
      {/* Header */}
      <section className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[200px] relative">
        <div className="bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[200px]">
          <nav className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/assets/images/logos/logo.svg"
                alt="Flyhan Logo"
                width={120}
                height={40}
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="bg-flysha-light-purple text-flysha-black px-4 py-1.5 rounded-full text-sm font-bold">
                🔄 Round Trip Checkout
              </span>
            </div>
          </nav>
          <div className="container max-w-[1130px] mx-auto pt-8">
            <h1 className="font-bold text-2xl">
              Complete Your Round Trip Booking
            </h1>
            <p className="text-flysha-off-purple">
              {departureFlight.departureCity} ⇄{" "}
              {departureFlight.destinationCity}
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0" />
        </div>
      </section>

      {/* Content */}
      <section className="container max-w-[1130px] mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Departure Flight Card */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-flysha-light-purple/20 text-flysha-light-purple px-3 py-1 rounded-full text-sm font-semibold">
                  ✈️ Departure
                </span>
                <span className="text-flysha-off-purple text-sm">
                  {formatDate(departureFlight.departureDate)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={departureFlight.plane.image}
                  alt={departureFlight.plane.name}
                  className="w-20 h-16 object-cover rounded-xl"
                />
                <div>
                  <p className="font-bold text-lg">
                    {departureFlight.plane.name}
                  </p>
                  <p className="text-flysha-off-purple text-sm">
                    {departureFlight.plane.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatTime(departureFlight.departureDate)}
                  </p>
                  <p className="text-flysha-off-purple">
                    {departureFlight.departureCityCode}
                  </p>
                  <p className="text-sm text-flysha-off-purple">
                    {departureFlight.departureCity}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="w-full h-0.5 bg-gradient-to-r from-flysha-light-purple to-green-400 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-3 text-2xl">
                      ✈️
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatTime(departureFlight.arrivalDate)}
                  </p>
                  <p className="text-flysha-off-purple">
                    {departureFlight.destinationCityCode}
                  </p>
                  <p className="text-sm text-flysha-off-purple">
                    {departureFlight.destinationCity}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-flysha-off-purple">{seatType} Class</span>
                <span className="font-bold text-lg text-flysha-light-purple">
                  {formatCurrency(departurePrice)}
                </span>
              </div>
            </div>

            {/* Return Flight Card */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                  🔄 Return
                </span>
                <span className="text-flysha-off-purple text-sm">
                  {formatDate(returnFlight.departureDate)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={returnFlight.plane.image}
                  alt={returnFlight.plane.name}
                  className="w-20 h-16 object-cover rounded-xl"
                />
                <div>
                  <p className="font-bold text-lg">{returnFlight.plane.name}</p>
                  <p className="text-flysha-off-purple text-sm">
                    {returnFlight.plane.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatTime(returnFlight.departureDate)}
                  </p>
                  <p className="text-flysha-off-purple">
                    {returnFlight.departureCityCode}
                  </p>
                  <p className="text-sm text-flysha-off-purple">
                    {returnFlight.departureCity}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="w-full h-0.5 bg-gradient-to-r from-green-400 to-flysha-light-purple relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-3 text-2xl">
                      ✈️
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatTime(returnFlight.arrivalDate)}
                  </p>
                  <p className="text-flysha-off-purple">
                    {returnFlight.destinationCityCode}
                  </p>
                  <p className="text-sm text-flysha-off-purple">
                    {returnFlight.destinationCity}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-flysha-off-purple">{seatType} Class</span>
                <span className="font-bold text-lg text-green-400">
                  {formatCurrency(returnPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Summary & Form */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-flysha-off-purple">
                    Departure Flight
                  </span>
                  <span>{formatCurrency(departurePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-flysha-off-purple">Return Flight</span>
                  <span>{formatCurrency(returnPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-flysha-off-purple">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>🎉 Round Trip Discount ({discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-flysha-light-purple">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-green-400 mt-1">
                  You save {formatCurrency(discountAmount)} with round trip!
                </p>
              </div>
            </div>

            {/* Checkout Form */}
            <RoundTripCheckoutForm
              departureFlightId={departureFlightId}
              returnFlightId={returnFlightId}
              departureSeats={departureSeats}
              returnSeats={returnSeats}
              preselectedDepartureSeatId={preselectedDepartureSeat?.id}
              preselectedReturnSeatId={preselectedReturnSeat?.id}
              seatType={seatType}
              userName={user?.name || ""}
              userPassport={user?.passport || ""}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
