import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export default async function SuccessCheckoutPage() {
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  const latestTicket = await prisma.ticket.findFirst({
    where: { customerId: user.id },
    orderBy: { bookingDate: "desc" },
  });

  if (!latestTicket) {
    redirect("/");
  }

  // Get tickets created around the same time (within 30 seconds of latest)
  // This handles sequential ticket creation in transaction
  const bookingTimeWindow = new Date(latestTicket.bookingDate);
  bookingTimeWindow.setSeconds(bookingTimeWindow.getSeconds() - 30);

  const tickets = await prisma.ticket.findMany({
    where: {
      customerId: user.id,
      bookingDate: {
        gte: bookingTimeWindow,
        lte: latestTicket.bookingDate,
      },
    },
    include: {
      flight: {
        include: {
          plane: true,
        },
      },
      seat: true,
      passenger: true,
    },
    orderBy: {
      seat: {
        seatNumber: "asc",
      },
    },
  });

  const flight = tickets[0].flight;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
            <ul className="nav-menus flex gap-[30px] items-center w-fit">
              <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </ul>
          </nav>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[103px] z-10 relative pb-20"
      >
        <div className="flex flex-col gap-10">
          {/* Title Section */}
          <div className="flex flex-col gap-[10px] items-center text-center">
            <h1 className="font-bold text-[32px] leading-[48px]">
              Success Checkout. <br />
              Enjoy Your Best Flight.
            </h1>
            <div className="flex gap-[14px]">
              <Link
                href="/"
                className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 px-6 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center"
              >
                Book More Flights
              </Link>
              <Link
                href="/my-tickets"
                className="font-semibold bg-flysha-black hover:bg-flysha-bg-purple border border-white hover:border-0 rounded-full h-12 px-6 transition-all duration-300 flex justify-center items-center"
              >
                View My Tickets
              </Link>
            </div>
          </div>

          {/* Ticket Cards Grid */}
          <div className="flex flex-wrap justify-center gap-[30px]">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white flex flex-col rounded-[20px] w-[340px] text-flysha-black shadow-lg"
              >
                <div className="flex flex-col p-[20px_20px_25px] border-b-2 border-dotted border-flysha-grey gap-4 relative">
                  <div className="flex w-[300px] h-[130px] shrink-0 rounded-[14px] overflow-hidden bg-[#EDE8F5]">
                    <img
                      src={flight.plane.image}
                      className="w-full h-full object-cover"
                      alt="thumbnail"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-bold text-lg text-flysha-black">
                        {flight.plane.name}
                      </p>
                      <p className="text-sm text-flysha-grey">
                        {flight.plane.code} • {ticket.seat.type} Class
                      </p>
                    </div>
                    <div className="flex h-fit">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <img
                          key={i}
                          src="/assets/images/icons/Star.svg"
                          className="w-5 h-5"
                          alt="star"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Circle Cutouts */}
                  <div className="flex justify-between items-center w-[370px] absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 -bottom-[30px]">
                    <div className="w-[30px] h-[30px] rounded-full flex shrink-0 bg-flysha-black"></div>
                    <div className="w-[30px] h-[30px] rounded-full flex shrink-0 bg-flysha-black"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-[10px] p-[25px_20px_20px]">
                  <div className="flex justify-between text-flysha-black">
                    <span>Date</span>
                    <span className="font-semibold">
                      {formatDate(flight.departureDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-flysha-black">
                    <span>Time</span>
                    <span className="font-semibold">
                      {formatTime(flight.departureDate)} -{" "}
                      {formatTime(flight.arrivalDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-flysha-black">
                    <span>Airport</span>
                    <span className="font-semibold">
                      {flight.departureCityCode} - {flight.destinationCityCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-flysha-black">
                    <span>Name</span>
                    <span className="font-semibold truncate max-w-[150px]">
                      {ticket.passenger?.name || user.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-flysha-black">
                    <span>Seat Chosen</span>
                    <span className="font-semibold text-right max-w-[150px] truncate">
                      {ticket.seat.seatNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-flysha-black">
                    <span>Passport No.</span>
                    <span className="font-semibold">
                      {ticket.passenger?.passport || user.passport || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
