import Navbar from "../../components/navbar";
import { getSavedFlights } from "./lib/actions";
import FlightCard from "../available-flights/components/flight-card";
import Link from "next/link";
import Image from "next/image";

export default async function WishlistPage() {
  const savedFlights = await getSavedFlights();

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen">
      <section className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[290px] relative">
        <div className="bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[290px]">
          <Navbar />
          <div className="container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">
              My Wishlist
            </h1>
            <p className="font-medium text-lg leading-[27px]">
              {savedFlights.length} saved flight
              {savedFlights.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0" />
        </div>
      </section>

      <section className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-[105px]">
        <div className="flex flex-col gap-6 w-full">
          {savedFlights.length > 0 ? (
            savedFlights.map((item) => (
              <FlightCard key={item.id} flight={item.flight} isSaved={true} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-flysha-bg-purple rounded-[20px]">
              <Image
                src="/assets/images/icons/ticket.svg"
                alt="No saved flights"
                width={80}
                height={80}
                className="opacity-30 mb-4"
              />
              <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
              <p className="text-flysha-off-purple mb-6">
                Save flights to track prices and book later.
              </p>
              <Link
                href="/"
                className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
              >
                Browse Flights
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
