import { notFound, redirect } from "next/navigation";
import { getFlightById } from "../../../lib/data";
import { getUser } from "@/lib/auth";
import SeatSelector from "./components/seat-selector";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seatType?: string }>;
}

export default async function ChooseSeatPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { seatType } = await searchParams;

  // Check if user is logged in
  const { session, user } = await getUser();
  if (!session || !user) {
    redirect("/signin");
  }

  // Fetch flight data
  const flight = await getFlightById(id);

  if (!flight) {
    notFound();
  }

  // Check if flight has already departed
  if (new Date(flight.departureDate) < new Date()) {
    redirect(`/available-flights?error=This flight has already departed`);
  }

  // Check if flight is cancelled
  if ((flight as any).status === "CANCELLED") {
    redirect(`/available-flights?error=This flight has been cancelled`);
  }

  // Determine price based on seat type
  // Use explicit casting or fallback logic until Prisma client is fully regenerated
  let price = flight.price;
  if (seatType === "ECONOMY")
    price = (flight as any).priceEconomy || flight.price;
  if (seatType === "BUSINESS")
    price = (flight as any).priceBusiness || Math.round(flight.price * 1.5);
  if (seatType === "FIRST")
    price = (flight as any).priceFirst || Math.round(flight.price * 2.5);

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen overflow-x-hidden">
      <SeatSelector
        seats={flight.seats} // Pass all seats
        flight={{
          id: flight.id,
          departureCity: flight.departureCity,
          departureCityCode: flight.departureCityCode,
          destinationCity: flight.destinationCity,
          destinationCityCode: flight.destinationCityCode,
          departureDate: flight.departureDate,
          arrivalDate: flight.arrivalDate,
          price: price, // Calculated initial price
          priceEconomy: (flight as any).priceEconomy,
          priceBusiness: (flight as any).priceBusiness,
          priceFirst: (flight as any).priceFirst,
          plane: flight.plane,
        }}
        seatType={seatType}
      />
    </div>
  );
}
