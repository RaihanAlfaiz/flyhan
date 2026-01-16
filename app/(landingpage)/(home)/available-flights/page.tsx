import Image from "next/image";
import Link from "next/link";
import { searchFlights, getAirplanes } from "../../lib/data";
import { getUser } from "@/lib/auth";
import ButtonLogout from "../../components/button-logout";
import FlightFilters from "./components/flight-filters";
import FlightCard from "./components/flight-card";
import RoundTripFlightList from "./components/round-trip-list";
import { getRoundTripDiscount } from "../checkout/round-trip/lib/actions";

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
    passengers?: string;
    error?: string;
    // New filter params
    sort?: "price_asc" | "price_desc" | "departure_asc" | "departure_desc";
    time?: "morning" | "afternoon" | "evening" | "night";
    minPrice?: string;
    maxPrice?: string;
    airlines?: string;
    // Round trip
    roundTrip?: string;
    returnDate?: string;
  }>;
}

export default async function AvailableFlightsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const {
    departure,
    arrival,
    date,
    seatType,
    passengers,
    error,
    sort,
    time,
    minPrice,
    maxPrice,
    airlines,
  } = params;

  const passengerCount = passengers ? parseInt(passengers, 10) : 1;
  const parsedMinPrice = minPrice ? parseInt(minPrice, 10) : undefined;
  const parsedMaxPrice = maxPrice ? parseInt(maxPrice, 10) : undefined;
  const parsedAirlines = airlines
    ? airlines.split(",").filter(Boolean)
    : undefined;

  // Round trip params
  const isRoundTrip = params.roundTrip === "true";
  const returnDateParam = params.returnDate;

  // Fetch flights based on search params
  const flights = await searchFlights({
    departureCode: departure,
    arrivalCode: arrival,
    date: date,
    seatType: seatType,
    passengerCount: passengerCount,
    sort: sort,
    time: time,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    airlines: parsedAirlines,
  });

  // Fetch return flights if round trip
  let returnFlights: typeof flights = [];
  if (isRoundTrip && returnDateParam) {
    returnFlights = await searchFlights({
      departureCode: arrival, // Swap departure and arrival
      arrivalCode: departure,
      date: returnDateParam,
      seatType: seatType,
      passengerCount: passengerCount,
      sort: sort,
      time: time,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      airlines: parsedAirlines,
    });
  }

  // Fetch airplanes for filter
  const airplanes = await getAirplanes();

  // Calculate max price for slider
  const allPrices = flights.map((f) => f.priceEconomy);
  const calculatedMaxPrice =
    allPrices.length > 0 ? Math.max(...allPrices) : 10000000;

  // Get city names for header
  const departureCity =
    flights.length > 0 ? flights[0].departureCity : departure || "Any";
  const arrivalCity =
    flights.length > 0 ? flights[0].destinationCity : arrival || "Any";

  // Get round trip discount for display
  const roundTripDiscount = isRoundTrip ? await getRoundTripDiscount() : 0;

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
            <p className="font-medium text-lg leading-[27px] flex items-center gap-3">
              <span>
                {flights.length.toLocaleString()} flight
                {flights.length !== 1 ? "s" : ""} available
              </span>
              <span className="text-flysha-light-purple">•</span>
              <span className="text-flysha-light-purple">
                {passengerCount} passenger{passengerCount !== 1 ? "s" : ""}
              </span>
              {seatType && (
                <>
                  <span className="text-flysha-light-purple">•</span>
                  <span className="text-flysha-light-purple capitalize">
                    {seatType.toLowerCase()}
                  </span>
                </>
              )}
              {isRoundTrip && (
                <>
                  <span className="text-flysha-light-purple">•</span>
                  <span className="bg-flysha-light-purple text-flysha-black px-2 py-0.5 rounded-full text-sm font-bold">
                    Round Trip
                  </span>
                </>
              )}
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
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-xl mb-6 shadow-lg flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="flex w-full gap-8">
          {/* Filters Sidebar */}
          <FlightFilters
            currentSeatType={seatType}
            airplanes={airplanes}
            departure={departure}
            arrival={arrival}
            date={date}
            passengers={passengers}
            maxPrice={calculatedMaxPrice}
          />

          {/* Flight Cards */}
          {isRoundTrip ? (
            <RoundTripFlightList
              departureFlights={flights}
              returnFlights={returnFlights}
              seatType={seatType}
              departureCity={departureCity}
              arrivalCity={arrivalCity}
              date={date}
              returnDate={returnDateParam}
              discountPercent={roundTripDiscount}
            />
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}
