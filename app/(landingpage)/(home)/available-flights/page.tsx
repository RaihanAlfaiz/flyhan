import Image from "next/image";
import Link from "next/link";
import { searchFlights, getAirplanes } from "../../lib/data";
import { getUser } from "@/lib/auth";
import ButtonLogout from "../../components/button-logout";
import FlightFilters from "./components/flight-filters";
import FlightCard from "./components/flight-card";

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format time
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Navbar Component
async function Navbar() {
  const { session, user } = await getUser();
  const isLoggedIn = !!session;

  return (
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
      <ul className="flex gap-[30px] items-center w-fit">
        <li>
          <Link
            href="/"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors"
          >
            Discover
          </Link>
        </li>
        <li>
          <Link
            href="#"
            className="font-medium text-white hover:text-flysha-light-purple transition-colors"
          >
            About
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            <span className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
              {user?.name?.slice(0, 2).toUpperCase() || "U"}
            </span>
            <ButtonLogout />
          </>
        ) : (
          <Link
            href="/signin"
            className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
          >
            Sign In
          </Link>
        )}
      </ul>
    </nav>
  );
}

// Page Props
interface PageProps {
  searchParams: Promise<{
    departure?: string;
    arrival?: string;
    date?: string;
    seatType?: "ECONOMY" | "BUSINESS" | "FIRST";
  }>;
}

export default async function AvailableFlightsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { departure, arrival, date, seatType } = params;

  // Fetch flights based on search params
  const flights = await searchFlights({
    departureCode: departure,
    arrivalCode: arrival,
    date: date,
    seatType: seatType,
  });

  // Fetch airplanes for filter
  const airplanes = await getAirplanes();

  // Get city names for header
  const departureCity =
    flights.length > 0 ? flights[0].departureCity : departure || "Any";
  const arrivalCity =
    flights.length > 0 ? flights[0].destinationCity : arrival || "Any";

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen">
      {/* Header Section */}
      <section
        id="Header"
        className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[290px] relative"
      >
        <div className="bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[290px]">
          <Navbar />
          <div className="container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">
              {departureCity} to {arrivalCity}
            </h1>
            <p className="font-medium text-lg leading-[27px]">
              {flights.length.toLocaleString()} flight
              {flights.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0" />
        </div>
      </section>

      {/* Content Section */}
      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-[105px]"
      >
        <div className="flex w-full gap-8">
          {/* Filters Sidebar */}
          <FlightFilters
            currentSeatType={seatType}
            airplanes={airplanes}
            departure={departure}
            arrival={arrival}
            date={date}
          />

          {/* Flight Cards */}
          <div className="ticket-container flex flex-col w-full gap-6">
            {flights.length > 0 ? (
              <>
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    seatType={seatType}
                  />
                ))}
                <p className="text-center text-sm text-[#A0A0AC] h-fit">
                  You&apos;ve reached the end of results.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Image
                  src="/assets/images/icons/airplane.svg"
                  alt="No flights"
                  width={80}
                  height={80}
                  className="opacity-30 mb-4"
                />
                <h3 className="text-xl font-bold mb-2">No flights found</h3>
                <p className="text-flysha-off-purple mb-6">
                  Try adjusting your search filters or selecting different
                  dates.
                </p>
                <Link
                  href="/"
                  className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
                >
                  Back to Search
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
