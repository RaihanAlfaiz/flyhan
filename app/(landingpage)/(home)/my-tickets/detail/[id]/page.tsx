import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import DownloadButton from "./components/download-button";

interface TicketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { id } = await params;
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      flight: {
        include: {
          plane: true,
        },
      },
      seat: true,
      passenger: true,
      addons: {
        include: {
          flightAddon: true,
        },
      },
      customer: true,
    },
  });

  if (!ticket || ticket.customerId !== user.id) {
    notFound();
  }

  // Formatters
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

  const formatCurrency = (val: number | bigint) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val));

  // Reverse Calculate Prices (Approximate)
  const grandTotal = Number(ticket.price);
  const seatPrice = Math.round(grandTotal / 1.21);
  const tax = Math.round(seatPrice * 0.11);
  const insurance = Math.round(seatPrice * 0.1);

  // Combine Default Benefits + Purchased Addons
  const defaultBenefits = [
    {
      title: "Business First",
      desc: ticket.flight.plane.name,
      icon: "/assets/images/icons/crown-white.svg",
    },
    {
      title: "Safe Guard",
      desc: "Airplane Metal X",
      icon: "/assets/images/icons/shield-tick-white.svg",
    },
  ];

  const purchasedAddons = ticket.addons.map((addon) => ({
    title: addon.flightAddon.title,
    desc: addon.requestDetail || "Premium Service",
    icon: "/assets/images/icons/crown-white.svg", // Using crown as generic addon icon
  }));

  const allBenefits = [...defaultBenefits, ...purchasedAddons];

  // Serialize for Client Component
  const serializedTicket = {
    ...ticket,
    price: ticket.price, // Pass as is, let serialization handle BigInt if configured, else convert
    bookingDate: ticket.bookingDate.toISOString(),
    flight: {
      ...ticket.flight,
      departureDate: ticket.flight.departureDate.toISOString(),
      arrivalDate: ticket.flight.arrivalDate.toISOString(),
    },
    // Ensure customer object exists
    customer: ticket.customer || { name: user.name },
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
            <div className="flex gap-4">
              {/* Back Button */}
              <Link
                href="/my-tickets"
                className="text-white hover:text-flysha-light-purple font-medium"
              >
                Back to My Tickets
              </Link>
            </div>
            <div className="flex gap-[30px] items-center w-fit">
              <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">
              Ticket Details
            </h1>
            <p className="font-medium text-lg leading-[27px]">
              Review your flight details
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-20"
      >
        <div className="flex flex-col gap-[30px]">
          <div className="flex gap-[30px]">
            <div className="w-[340px] flex flex-col gap-5 shrink-0">
              {/* Flight Details Card */}
              <div className="bg-white p-5 rounded-[20px] flex flex-col gap-4 text-flysha-black shadow-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Flight Info</h3>
                  <span className="text-flysha-light-purple font-bold text-sm">
                    {ticket.status}
                  </span>
                </div>

                {/* Image */}
                <div className="w-full h-[140px] rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={ticket.flight.plane.image}
                    className="w-full h-full object-cover"
                    alt="plane"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking Code</span>
                    <span className="font-bold text-flysha-dark-purple">
                      {ticket.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passenger</span>
                    <span className="font-bold truncate max-w-[150px]">
                      {ticket.passenger?.name || user.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seat</span>
                    <span className="font-bold">
                      {ticket.seat.seatNumber} ({ticket.seat.type})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-bold">
                      {formatDate(ticket.flight.departureDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-bold">
                      {formatTime(ticket.flight.departureDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route</span>
                    <span className="font-bold">
                      {ticket.flight.departureCityCode} -{" "}
                      {ticket.flight.destinationCityCode}
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <DownloadButton ticket={serializedTicket as any} />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              {/* Addons / Benefits Section */}
              <div className="bg-flysha-bg-purple p-[30px] rounded-[20px] border border-white/10 flex flex-col gap-5">
                <h3 className="font-bold text-xl">Your Benefits</h3>
                <div className="grid grid-cols-2 gap-5">
                  {allBenefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-flysha-light-purple/20 flex items-center justify-center shrink-0">
                        <Image
                          src={benefit.icon}
                          width={20}
                          height={20}
                          alt="icon"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">
                          {benefit.title}
                        </p>
                        <p className="text-xs text-flysha-off-purple">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-flysha-bg-purple p-[30px] rounded-[20px] border border-white/10 flex flex-col gap-5">
                <h3 className="font-bold text-xl">Price Details</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-flysha-off-purple">Seat Price</span>
                    <span className="font-bold">
                      {formatCurrency(seatPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-flysha-off-purple">Tax (11%)</span>
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-flysha-off-purple">Insurance</span>
                    <span className="font-bold">
                      {formatCurrency(insurance)}
                    </span>
                  </div>
                  <div className="w-full h-px bg-white/10 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-flysha-off-purple">Grand Total</span>
                    <span className="font-bold text-2xl text-flysha-light-purple">
                      {formatCurrency(Number(ticket.price))}
                    </span>
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
