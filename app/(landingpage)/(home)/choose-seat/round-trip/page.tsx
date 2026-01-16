import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { holdSeats } from "@/app/(landingpage)/(home)/checkout/lib/seat-hold"; // Reusing existing seat hold logic
import RoundTripSeatSelector from "./components/seat-selector";
import { calculateRoundTripPrice } from "@/app/(landingpage)/(home)/checkout/round-trip/lib/actions";

interface PageProps {
  searchParams: Promise<{
    departureFlightId?: string;
    returnFlightId?: string;
    seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
    passengers?: string;
  }>;
}

export default async function RoundTripSeatPage({ searchParams }: PageProps) {
  const { session, user } = await getUser();

  if (!session || !user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const {
    departureFlightId,
    returnFlightId,
    seatType = "ECONOMY",
    passengers = "1",
  } = params;

  const passengerCount = parseInt(passengers) || 1;

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
    discountPercent,
  } = pricing;

  // Get seats for each flight
  const [departureSeats, returnSeats] = await Promise.all([
    prisma.flightSeat.findMany({
      where: { flightId: departureFlightId },
      orderBy: { seatNumber: "asc" },
    }),
    prisma.flightSeat.findMany({
      where: { flightId: returnFlightId },
      orderBy: { seatNumber: "asc" },
    }),
  ]);

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen overflow-x-hidden">
      <RoundTripSeatSelector
        departureFlight={{
          id: departureFlight.id,
          departureCity: departureFlight.departureCity,
          departureCityCode: departureFlight.departureCityCode,
          destinationCity: departureFlight.destinationCity,
          destinationCityCode: departureFlight.destinationCityCode,
          departureDate: departureFlight.departureDate,
          arrivalDate: departureFlight.arrivalDate,
          price: departurePrice,
          plane: departureFlight.plane,
        }}
        returnFlight={{
          id: returnFlight.id,
          departureCity: returnFlight.departureCity,
          departureCityCode: returnFlight.departureCityCode,
          destinationCity: returnFlight.destinationCity,
          destinationCityCode: returnFlight.destinationCityCode,
          departureDate: returnFlight.departureDate,
          arrivalDate: returnFlight.arrivalDate,
          price: returnPrice,
          plane: returnFlight.plane,
        }}
        departureSeats={departureSeats}
        returnSeats={returnSeats}
        seatType={seatType}
        discountPercent={discountPercent}
        passengerCount={passengerCount}
        currentUserId={user.id}
      />
    </div>
  );
}
