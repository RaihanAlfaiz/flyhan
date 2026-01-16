import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import RoundTripPassengerForm from "./components/passenger-form";
import {
  calculateRoundTripPrice,
  getRoundTripDiscount,
} from "@/app/(landingpage)/(home)/checkout/round-trip/lib/actions";

interface PageProps {
  searchParams: Promise<{
    departureFlightId?: string;
    returnFlightId?: string;
    departureSeatIds?: string;
    returnSeatIds?: string;
    seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  }>;
}

export default async function RoundTripPassengerDetailsPage({
  searchParams,
}: PageProps) {
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const {
    departureFlightId,
    returnFlightId,
    departureSeatIds,
    returnSeatIds,
    seatType = "ECONOMY",
  } = params;

  if (
    !departureFlightId ||
    !returnFlightId ||
    !departureSeatIds ||
    !returnSeatIds
  ) {
    redirect("/available-flights?error=Missing+flight+or+seat+selection");
  }

  // Fetch flights
  const [departureFlight, returnFlight] = await Promise.all([
    prisma.flight.findUnique({
      where: { id: departureFlightId },
      include: { plane: true, seats: true },
    }),
    prisma.flight.findUnique({
      where: { id: returnFlightId },
      include: { plane: true, seats: true },
    }),
  ]);

  if (!departureFlight || !returnFlight) {
    redirect("/available-flights?error=Flight+not+found");
  }

  // Get selected seats
  const departureSeatIdArray = departureSeatIds.split(",");
  const returnSeatIdArray = returnSeatIds.split(",");

  const departureSeats = departureFlight.seats.filter((s) =>
    departureSeatIdArray.includes(s.id)
  );
  const returnSeats = returnFlight.seats.filter((s) =>
    returnSeatIdArray.includes(s.id)
  );

  if (departureSeats.length === 0 || returnSeats.length === 0) {
    redirect("/available-flights?error=Invalid+seat+selection");
  }

  // Get discount
  const discountPercent = await getRoundTripDiscount();

  return (
    <div
      className="text-white font-sans bg-flysha-black min-h-screen font-poppins pb-64"
      style={{ backgroundColor: "#080318" }}
    >
      <section
        id="Header"
        className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[290px] relative"
      >
        <div className="Header-content bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[290px]">
          <nav
            id="Navbar"
            className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]"
          >
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/assets/images/logos/logo.svg"
                alt="logo"
                width={120}
                height={40}
              />
            </Link>
            <div className="flex items-center gap-3">
              <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold">
                🔄 Round Trip Booking
              </span>
              <span className="bg-flysha-light-purple/20 text-flysha-light-purple px-4 py-1.5 rounded-full text-sm font-bold">
                🎉 {discountPercent}% OFF
              </span>
            </div>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">
              Passenger Details
            </h1>
            <p className="font-medium text-lg leading-[27px]">
              Fill in the passenger information for your round trip
            </p>
          </div>
        </div>
      </section>

      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-20"
      >
        <div className="flex flex-col lg:flex-row gap-[50px]">
          {/* Form Section */}
          <div className="flex-1">
            <RoundTripPassengerForm
              departureSeats={departureSeats.map((s) => ({
                id: s.id,
                seatNumber: s.seatNumber,
                type: s.type,
              }))}
              returnSeats={returnSeats.map((s) => ({
                id: s.id,
                seatNumber: s.seatNumber,
                type: s.type,
              }))}
              departureFlightId={departureFlightId}
              returnFlightId={returnFlightId}
              seatType={seatType}
            />
          </div>

          {/* Flight Info Sidebar */}
          <div className="w-[340px] shrink-0 space-y-4">
            {/* Departure */}
            <div className="bg-white rounded-[20px] p-5 text-flysha-black shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-flysha-light-purple/20 text-flysha-dark-purple px-2 py-0.5 rounded text-xs font-semibold">
                  ✈️ Departure
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[60px] h-[45px] rounded-lg overflow-hidden shrink-0 bg-[#EDE8F5]">
                  <img
                    src={departureFlight.plane.image}
                    className="w-full h-full object-cover"
                    alt="plane"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    {departureFlight.plane.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {departureFlight.plane.code}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {new Date(departureFlight.departureDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-semibold">
                    {departureFlight.departureCityCode} →{" "}
                    {departureFlight.destinationCityCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Seats</span>
                  <div className="flex flex-wrap gap-1">
                    {departureSeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="bg-flysha-light-purple/20 text-flysha-dark-purple px-2 py-0.5 rounded text-xs font-semibold"
                      >
                        {seat.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Return */}
            <div className="bg-white rounded-[20px] p-5 text-flysha-black shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-500/20 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                  🔄 Return
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-[60px] h-[45px] rounded-lg overflow-hidden shrink-0 bg-[#EDE8F5]">
                  <img
                    src={returnFlight.plane.image}
                    className="w-full h-full object-cover"
                    alt="plane"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    {returnFlight.plane.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {returnFlight.plane.code}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-semibold">
                    {new Date(returnFlight.departureDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-semibold">
                    {returnFlight.departureCityCode} →{" "}
                    {returnFlight.destinationCityCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Seats</span>
                  <div className="flex flex-wrap gap-1">
                    {returnSeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="bg-green-500/20 text-green-700 px-2 py-0.5 rounded text-xs font-semibold"
                      >
                        {seat.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
