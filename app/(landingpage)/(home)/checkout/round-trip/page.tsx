import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import RoundTripCheckoutContent from "./components/checkout-content";
import { holdSeats } from "../lib/seat-hold"; // Reusing existing seat hold logic
import { getRoundTripDiscount } from "./lib/actions";
import { getFlightAddons } from "@/app/dashboard/(home)/flight-addons/lib/data";

interface CheckoutPageProps {
  searchParams: Promise<{
    departureFlightId?: string;
    returnFlightId?: string;
    departureSeatIds?: string;
    returnSeatIds?: string;
    seatType?: string;
  }>;
}

export default async function RoundTripCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
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

  // Parse seat IDs and find seats
  const departureSeatIdArray = departureSeatIds.split(",");
  const returnSeatIdArray = returnSeatIds.split(",");

  const departureSeats = departureFlight.seats.filter((s) =>
    departureSeatIdArray.includes(s.id)
  );
  const returnSeats = returnFlight.seats.filter((s) =>
    returnSeatIdArray.includes(s.id)
  );

  if (departureSeats.length === 0 || returnSeats.length === 0) {
    redirect(
      `/choose-seat/round-trip?departureFlightId=${departureFlightId}&returnFlightId=${returnFlightId}&seatType=${seatType}`
    );
  }

  // Hold seats (Departure)
  const depHoldResult = await holdSeats(
    departureFlightId,
    departureSeatIdArray
  );
  if (!depHoldResult.success) {
    redirect(
      `/choose-seat/round-trip?error=${encodeURIComponent(
        "Departure: " + depHoldResult.message
      )}`
    );
  }

  // Hold seats (Return)
  const retHoldResult = await holdSeats(returnFlightId, returnSeatIdArray);
  if (!retHoldResult.success) {
    // Note: Should probably release departure seats here if return fails, but for MVP keep it simple
    redirect(
      `/choose-seat/round-trip?error=${encodeURIComponent(
        "Return: " + retHoldResult.message
      )}`
    );
  }

  // Use the earliest hold expiry
  const depExpiry = depHoldResult.holdUntil?.getTime() || 0;
  const retExpiry = retHoldResult.holdUntil?.getTime() || 0;
  const holdUntil = new Date(Math.min(depExpiry, retExpiry)).toISOString();

  // Get Discount
  const discountPercent = await getRoundTripDiscount();

  // Get Addons
  const addons = await getFlightAddons();

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen">
      {/* Header Section */}
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
            <ul className="nav-menus flex gap-[30px] items-center w-fit">
              <div className="flex items-center gap-3">
                <span className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold">
                  Round Trip Checkout
                </span>
              </div>
              <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </ul>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">Checkout</h1>
            <p className="font-medium text-lg leading-[27px]">
              Confirm your round trip booking
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      {/* Content Section */}
      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-20"
      >
        <RoundTripCheckoutContent
          departureFlight={departureFlight}
          returnFlight={returnFlight}
          departureSeats={departureSeats}
          returnSeats={returnSeats}
          user={user}
          holdUntil={holdUntil}
          seatType={seatType}
          discountPercent={discountPercent}
          addons={addons}
        />
      </section>
    </div>
  );
}
