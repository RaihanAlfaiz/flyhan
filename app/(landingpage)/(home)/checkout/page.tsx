import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getFlightById } from "@/app/(landingpage)/lib/data";
import { redirect } from "next/navigation";
import PaymentButton from "./components/payment-button";
import CheckoutContent from "./components/checkout-content";
import { getFlightAddons } from "@/app/dashboard/(home)/flight-addons/lib/data";
import { holdSeats } from "./lib/seat-hold";

// Helper for currency formatting
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

interface CheckoutPageProps {
  searchParams: Promise<{
    flightId?: string;
    seatIds?: string;
  }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
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

  // Parse seat IDs and find seats
  const seatIdArray = seatIds.split(",");
  const seats = flight.seats.filter((s) => seatIdArray.includes(s.id));

  if (seats.length === 0) {
    redirect(`/choose-seat/${flightId}`);
  }

  // Hold seats for this user (10 min reservation)
  const holdResult = await holdSeats(flightId, seatIdArray);

  if (!holdResult.success) {
    // Seats are no longer available, redirect with error
    redirect(
      `/choose-seat/${flightId}?error=${encodeURIComponent(holdResult.message)}`
    );
  }

  const addons = await getFlightAddons();

  // Pass holdUntil to client for countdown timer

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
              <li>
                <Link
                  href="#"
                  className="font-medium hover:text-flysha-light-purple transition-colors"
                >
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-medium hover:text-flysha-light-purple transition-colors"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-medium hover:text-flysha-light-purple transition-colors"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-medium hover:text-flysha-light-purple transition-colors"
                >
                  Stories
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="font-medium hover:text-flysha-light-purple transition-colors"
                >
                  About
                </Link>
              </li>
              <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </ul>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">Checkout</h1>
            <p className="font-medium text-lg leading-[27px]">
              Enjoy new experience of flight
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
        <CheckoutContent
          flight={flight}
          seats={seats}
          user={user}
          addons={addons}
          holdUntil={holdResult.holdUntil?.toISOString()}
        />
      </section>
    </div>
  );
}
