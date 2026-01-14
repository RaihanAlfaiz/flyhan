import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import RefundForm from "./components/refund-form";

interface RefundPageProps {
  params: Promise<{ id: string }>;
}

export default async function RefundPage({ params }: RefundPageProps) {
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
      refundRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket || ticket.customerId !== user.id) {
    redirect("/my-tickets");
  }

  const flightStatus = (ticket.flight as any).status || "SCHEDULED";

  if (flightStatus === "SCHEDULED") {
    redirect("/my-tickets");
  }

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
    });
  };

  const formatCurrency = (amount: bigint | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const hasPendingRequest = ticket.refundRequests.some(
    (r) => r.status === "PENDING"
  );

  return (
    <div className="text-white font-sans bg-flysha-black min-h-screen font-poppins">
      <section
        id="Header"
        className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[250px] relative"
      >
        <div className="Header-content bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[250px]">
          <nav className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/assets/images/logos/logo.svg"
                alt="logo"
                width={120}
                height={40}
              />
            </Link>
            <Link
              href="/my-tickets"
              className="text-flysha-light-purple font-medium hover:underline"
            >
              ← Back to My Tickets
            </Link>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[40px]">
            <h1 className="font-bold text-[28px] leading-[42px]">
              Refund / Reschedule Request
            </h1>
            <p className="text-flysha-off-purple">
              Ticket Code:{" "}
              <span className="font-bold text-white">{ticket.code}</span>
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section className="container max-w-[900px] mx-auto -mt-[30px] pb-[100px] z-10 relative">
        {/* Flight Details Card */}
        <div className="bg-flysha-bg-purple rounded-[20px] p-6 mb-6 shadow-[0px_30px_30px_0px_#080318]">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={ticket.flight.plane.image}
              alt={ticket.flight.plane.name}
              className="w-20 h-14 object-cover rounded-lg"
            />
            <div>
              <h2 className="font-bold text-lg">{ticket.flight.plane.name}</h2>
              <p className="text-sm text-flysha-off-purple">
                {ticket.seat.type} Class • Seat {ticket.seat.seatNumber}
              </p>
            </div>
            <div
              className={`ml-auto px-4 py-2 rounded-full font-semibold text-sm ${
                flightStatus === "CANCELLED"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {flightStatus}
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-700">
            <div className="text-center">
              <p className="font-bold text-xl">
                {ticket.flight.departureCityCode}
              </p>
              <p className="text-sm text-flysha-off-purple">
                {ticket.flight.departureCity}
              </p>
              <p className="text-xs text-flysha-off-purple mt-1">
                {formatDate(ticket.flight.departureDate)}
              </p>
              <p className="text-sm font-medium">
                {formatTime(ticket.flight.departureDate)}
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="w-full flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-flysha-light-purple" />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-flysha-light-purple to-flysha-light-purple/50" />
                <div className="w-3 h-3 rounded-full bg-flysha-light-purple/50" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">
                {ticket.flight.destinationCityCode}
              </p>
              <p className="text-sm text-flysha-off-purple">
                {ticket.flight.destinationCity}
              </p>
              <p className="text-xs text-flysha-off-purple mt-1">
                {formatDate(ticket.flight.arrivalDate)}
              </p>
              <p className="text-sm font-medium">
                {formatTime(ticket.flight.arrivalDate)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between">
              <span className="text-flysha-off-purple">Passenger</span>
              <span className="font-medium">
                {ticket.passenger?.name || user.name}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-flysha-off-purple">Ticket Price</span>
              <span className="font-bold text-flysha-light-purple">
                {formatCurrency(ticket.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Request History */}
        {ticket.refundRequests.length > 0 && (
          <div className="bg-flysha-bg-purple rounded-[20px] p-6 mb-6 shadow-[0px_30px_30px_0px_#080318]">
            <h3 className="font-bold text-lg mb-4">Request History</h3>
            <div className="space-y-3">
              {ticket.refundRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    request.status === "PENDING"
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : request.status === "APPROVED"
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-red-500/50 bg-red-500/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{request.type} Request</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        request.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : request.status === "APPROVED"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-flysha-off-purple">
                    {request.reason}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted:{" "}
                    {new Date(request.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Form */}
        {!hasPendingRequest ? (
          <div className="bg-flysha-bg-purple rounded-[20px] p-6 shadow-[0px_30px_30px_0px_#080318]">
            <h3 className="font-bold text-lg mb-4">Submit New Request</h3>
            <RefundForm ticketId={ticket.id} flightStatus={flightStatus} />
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-[20px] p-6 text-center">
            <p className="text-yellow-400 font-medium">
              You have a pending request. Please wait for our response.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
