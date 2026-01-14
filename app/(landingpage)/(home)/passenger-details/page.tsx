import { getFlightById } from "@/app/(landingpage)/lib/data";
import { getUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PassengerForm from "./components/passenger-form";

interface PassengerDetailsPageProps {
  searchParams: Promise<{
    flightId?: string;
    seatIds?: string;
  }>;
}

export default async function PassengerDetailsPage({
  searchParams,
}: PassengerDetailsPageProps) {
  const { flightId, seatIds } = await searchParams;
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  if (!flightId || !seatIds) {
    redirect("/");
  }

  const flight = await getFlightById(flightId);

  if (!flight) {
    redirect("/");
  }

  // Check if flight has already departed
  if (new Date(flight.departureDate) < new Date()) {
    redirect(`/available-flights?error=This flight has already departed`);
  }

  // Check if flight is cancelled
  if ((flight as any).status === "CANCELLED") {
    redirect(`/available-flights?error=This flight has been cancelled`);
  }

  const seatIdArray = seatIds.split(",");
  const seats = flight.seats.filter((s) => seatIdArray.includes(s.id));

  // Sort seats by seatNumber for tidy display
  seats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen font-poppins">
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
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">
              Passenger Details
            </h1>
            <p className="font-medium text-lg leading-[27px]">
              Fill in the passenger information
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
            <PassengerForm
              seats={seats.map((s) => ({
                id: s.id,
                seatNumber: s.seatNumber,
                type: s.type,
              }))}
              flightId={flightId}
            />
          </div>

          {/* Flight Info Sidebar */}
          <div className="w-[340px] shrink-0 h-fit bg-white rounded-[20px] p-5 text-flysha-black shadow-lg">
            <h3 className="font-bold text-xl mb-4">Flight Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-[80px] h-[60px] rounded-lg overflow-hidden shrink-0 bg-[#EDE8F5]">
                  <img
                    src={flight.plane.image}
                    className="w-full h-full object-cover"
                    alt="plane"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{flight.plane.name}</span>
                  <span className="text-sm text-gray-500">
                    {flight.plane.code}
                  </span>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">
                  {new Date(flight.departureDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold">
                  {new Date(flight.departureDate).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold">
                  {flight.departureCityCode} - {flight.destinationCityCode}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Seats Selected</span>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat) => (
                    <span
                      key={seat.id}
                      className="bg-flysha-light-purple/20 text-flysha-dark-purple px-2 py-1 rounded-md text-sm font-semibold"
                    >
                      {seat.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
