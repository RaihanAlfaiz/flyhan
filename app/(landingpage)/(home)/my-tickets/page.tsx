import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, XCircle, Clock } from "lucide-react";

export default async function MyTicketsPage() {
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  const tickets = await prisma.ticket.findMany({
    where: { customerId: user.id },
    include: {
      flight: {
        include: {
          plane: true,
        },
      },
      seat: true,
      passenger: true,
      refundRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { bookingDate: "desc" },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
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

  const getFlightStatusBadge = (status: string) => {
    if (status === "DELAYED") {
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
          <Clock className="h-3 w-3" />
          DELAYED
        </div>
      );
    }
    if (status === "CANCELLED") {
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
          <XCircle className="h-3 w-3" />
          CANCELLED
        </div>
      );
    }
    return null;
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
              <li>
                <Link href="/" className="font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/my-tickets"
                  className="font-medium text-flysha-light-purple"
                >
                  My Tickets
                </Link>
              </li>
              <Link href="/profile/settings">
                <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </Link>
            </ul>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px]">My Tickets</h1>
            <p className="font-medium text-lg leading-[27px]">
              {tickets.length} tickets booked
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section
        id="Content"
        className="container max-w-[1130px] mx-auto flex justify-center -mt-[60px] pb-[100px] z-10 relative"
      >
        <div className="ticket-container flex flex-col w-[900px] gap-6">
          {tickets.length > 0 ? (
            tickets.map((ticket) => {
              const flightStatus = (ticket.flight as any).status || "SCHEDULED";

              return (
                <div
                  key={ticket.id}
                  className={`ticket-card flex flex-col rounded-[20px] overflow-hidden bg-flysha-bg-purple shadow-[0px_30px_30px_0px_#080318] ${
                    flightStatus === "CANCELLED"
                      ? "border-2 border-red-500/50"
                      : flightStatus === "DELAYED"
                      ? "border-2 border-yellow-500/50"
                      : ""
                  }`}
                >
                  {/* Flight Status Alert */}
                  {flightStatus !== "SCHEDULED" && (
                    <div
                      className={`px-5 py-3 flex items-center gap-3 ${
                        flightStatus === "CANCELLED"
                          ? "bg-red-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          flightStatus === "CANCELLED"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-semibold text-sm ${
                            flightStatus === "CANCELLED"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {flightStatus === "CANCELLED"
                            ? "This flight has been cancelled"
                            : "This flight has been delayed"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {flightStatus === "CANCELLED"
                            ? "Please request a refund or reschedule below"
                            : "Check with the airline for updated departure time"}
                        </p>
                      </div>
                      {getFlightStatusBadge(flightStatus)}
                    </div>
                  )}

                  {/* Ticket Content */}
                  <div className="flex justify-between items-center p-5">
                    <div className="flex gap-[16px] items-center">
                      <div className="flex shrink-0 w-[90px] h-[70px] rounded-[14px] overflow-hidden">
                        <img
                          src={ticket.flight.plane.image}
                          className="w-full h-full object-cover"
                          alt="thumbnail"
                        />
                      </div>
                      <div className="flex flex-col justify-center-center gap-[2px]">
                        <p className="font-bold text-lg">
                          {ticket.flight.plane.name}
                        </p>
                        <p className="text-sm text-flysha-off-purple">
                          {ticket.seat.type} Class • Seat{" "}
                          {ticket.seat.seatNumber}
                        </p>
                        <p className="text-xs text-flysha-off-purple">
                          {ticket.passenger?.name || user.name}
                        </p>
                      </div>
                    </div>
                    <p className="w-fit h-fit font-bold text-lg">
                      {formatDate(ticket.flight.departureDate)}
                    </p>
                    <div className="flex items-center gap-[30px]">
                      <div className="flex flex-col gap-[2px] text-center">
                        <p className="font-bold text-lg">
                          {formatTime(ticket.flight.departureDate)}
                        </p>
                        <p className="text-sm text-flysha-off-purple">
                          {ticket.flight.departureCityCode}
                        </p>
                      </div>
                      <img
                        src="/assets/images/icons/plane-dotted.svg"
                        alt="icon"
                      />
                      <div className="flex flex-col gap-[2px] text-center">
                        <p className="font-bold text-lg">
                          {formatTime(ticket.flight.arrivalDate)}
                        </p>
                        <p className="text-sm text-flysha-off-purple">
                          {ticket.flight.destinationCityCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/my-tickets/detail/${ticket.id}`}
                        className="font-bold text-flysha-black bg-flysha-light-purple rounded-full p-[12px_20px] h-[48px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex items-center justify-center text-sm"
                      >
                        Details
                      </Link>
                      {(flightStatus === "DELAYED" ||
                        flightStatus === "CANCELLED") &&
                        ticket.status === "SUCCESS" &&
                        ticket.refundRequests.length === 0 && (
                          <Link
                            href={`/my-tickets/refund/${ticket.id}`}
                            className="font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full p-[8px_16px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#ff6b6b] flex items-center justify-center text-xs"
                          >
                            Request Refund/Reschedule
                          </Link>
                        )}
                      {/* Refund Status Display */}
                      {ticket.refundRequests.length > 0 && (
                        <div className="text-center">
                          {ticket.refundRequests[0].status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              Menunggu Persetujuan
                            </span>
                          )}
                          {ticket.refundRequests[0].status === "APPROVED" && (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                                ✓{" "}
                                {ticket.refundRequests[0].type === "REFUND"
                                  ? "Refund"
                                  : "Reschedule"}{" "}
                                Disetujui
                              </span>
                              {ticket.refundRequests[0].refundAmount && (
                                <span className="text-xs text-green-300">
                                  Rp{" "}
                                  {Number(
                                    ticket.refundRequests[0].refundAmount
                                  ).toLocaleString("id-ID")}
                                </span>
                              )}
                            </div>
                          )}
                          {ticket.refundRequests[0].status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                              ✕ Permohonan Ditolak
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-flysha-off-purple">
                You haven't booked any flights yet.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 font-bold text-flysha-black bg-flysha-light-purple rounded-full p-[12px_24px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
              >
                Search Flights
              </Link>
            </div>
          )}
          {tickets.length > 0 && (
            <p className="text-center text-sm text-[#A0A0AC] h-fit">
              You've reached the end of results.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
