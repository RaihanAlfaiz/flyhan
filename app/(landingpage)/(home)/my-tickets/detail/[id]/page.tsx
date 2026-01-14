import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

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
              <li>
                <Link href="#" className="font-medium">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="font-medium">
                  About
                </Link>
              </li>
              <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </ul>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex gap-[30px] pt-[50px] pb-[68px]">
            <p className="flex items-center gap-[30px] font-medium text-lg">
              <Link href="/my-tickets">My Tickets</Link>
              <span>/</span>
              <span>Details</span>
              <span>/</span>
            </p>
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-[32px] leading-[48px]">
                {ticket.flight.departureCity} to {ticket.flight.destinationCity}
              </h1>
              <p className="font-medium text-lg leading-[27px]">
                {formatDate(ticket.flight.departureDate)}
              </p>
            </div>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section
        id="Content"
        className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-20"
      >
        <div className="checkout-container flex-col lg:flex-row flex gap-[70px]">
          {/* Left Column: Ticket Info */}
          <div className="bg-white flex flex-col rounded-[20px] w-[340px] text-flysha-black">
            <div className="flex flex-col p-[20px_20px_25px] border-b-2 border-dotted border-flysha-grey gap-4 relative">
              <div className="flex w-[300px] h-[130px] shrink-0 rounded-[14px] overflow-hidden bg-[#EDE8F5]">
                <img
                  src={ticket.flight.plane.image}
                  className="w-full h-full object-cover"
                  alt="thumbnail"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-[2px]">
                  <p className="font-bold text-lg text-flysha-black">
                    {ticket.flight.plane.name}
                  </p>
                  <p className="text-sm text-flysha-grey">
                    {ticket.flight.plane.code} • {ticket.seat.type} Class
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
              <div className="flex justify-between items-center w-[370px] absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 -bottom-[30px]">
                <div className="w-[30px] h-[30px] rounded-full flex shrink-0 bg-flysha-black"></div>
                <div className="w-[30px] h-[30px] rounded-full flex shrink-0 bg-flysha-black"></div>
              </div>
            </div>
            <div className="flex flex-col gap-[10px] p-[25px_20px_20px]">
              <div className="flex justify-between text-flysha-black">
                <span>Date</span>
                <span className="font-semibold">
                  {formatDate(ticket.flight.departureDate)}
                </span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Time</span>
                <span className="font-semibold">
                  {formatTime(ticket.flight.departureDate)} -{" "}
                  {formatTime(ticket.flight.arrivalDate)}
                </span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Airport</span>
                <span className="font-semibold">
                  {ticket.flight.departureCityCode} -{" "}
                  {ticket.flight.destinationCityCode}
                </span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Name</span>
                <span className="font-semibold">
                  {ticket.passenger?.name || user.name}
                </span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Seat Chosen</span>
                <span className="font-semibold">{ticket.seat.seatNumber}</span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Passport No.</span>
                <span className="font-semibold">
                  {ticket.passenger?.passport || user.passport || "-"}
                </span>
              </div>
              <div className="flex justify-between text-flysha-black">
                <span>Passenger</span>
                <span className="font-semibold">1 Person</span>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits & Prices */}
          <div className="flex flex-col mt-[63px] gap-[30px]">
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Additional Benefits</p>
              <div className="flex flex-wrap gap-[30px]">
                <div className="benefit-card flex items-center gap-[14px] p-[14px_20px] ring-1 ring-white rounded-[20px]">
                  <div className="w-8 h-8 flex shrink-0">
                    <img
                      src="/assets/images/icons/crown-white.svg"
                      className="w-8 h-8"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-bold text-lg">Business First</p>
                    <p className="text-flysha-off-purple">
                      {ticket.flight.plane.name}
                    </p>
                  </div>
                </div>
                <div className="benefit-card flex items-center gap-[14px] p-[14px_20px] ring-1 ring-white rounded-[20px]">
                  <div className="w-8 h-8 flex shrink-0">
                    <img
                      src="/assets/images/icons/shield-tick-white.svg"
                      className="w-8 h-8"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-bold text-lg">Safe Guard</p>
                    <p className="text-flysha-off-purple">Airplane Metal X</p>
                  </div>
                </div>
                <div className="benefit-card flex items-center gap-[14px] p-[14px_20px] ring-1 ring-white rounded-[20px]">
                  <div className="w-8 h-8 flex shrink-0">
                    <img
                      src="/assets/images/icons/building-3-white.svg"
                      className="w-8 h-8"
                      alt="icon"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-bold text-lg">Home Pickup</p>
                    <p className="text-flysha-off-purple">Bentley Banta</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[30px] w-full max-w-[400px]">
              <div className="flex flex-col gap-[18px]">
                <p className="font-semibold">Payment Details</p>
                <div className="flex justify-between">
                  <span>ID Transaction</span>
                  <span className="font-semibold">{ticket.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seat Price</span>
                  <span className="font-semibold">
                    {formatCurrency(seatPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance 10%</span>
                  <span className="font-semibold">
                    {formatCurrency(insurance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax & Fees 11%</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-4 mt-2">
                  <span>Grand Total</span>
                  <span className="font-bold text-flysha-light-purple text-xl">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-bold text-[#8DFFBA]">Success Paid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
