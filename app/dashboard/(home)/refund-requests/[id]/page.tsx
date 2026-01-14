import { getRefundRequestById } from "../lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionButtons from "./components/action-buttons";

interface RefundDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: bigint | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export default async function RefundDetailPage({
  params,
}: RefundDetailPageProps) {
  const { id } = await params;
  const request = await getRefundRequestById(id);

  if (!request) {
    redirect("/dashboard/refund-requests");
  }

  const flightStatus = (request.ticket.flight as any).status || "SCHEDULED";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Request Detail</h1>
        <Link
          href="/dashboard/refund-requests"
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          ← Back to List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h6 className="text-[#4e73df] font-bold">Request Information</h6>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                  request.status === "PENDING"
                    ? "bg-[#f6c23e]/10 text-[#f6c23e]"
                    : request.status === "APPROVED"
                    ? "bg-[#1cc88a]/10 text-[#1cc88a]"
                    : "bg-[#e74a3b]/10 text-[#e74a3b]"
                }`}
              >
                {request.status}
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                    Request Type
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                      request.type === "REFUND"
                        ? "bg-[#e74a3b]/10 text-[#e74a3b]"
                        : "bg-[#36b9cc]/10 text-[#36b9cc]"
                    }`}
                  >
                    {request.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                    Submitted
                  </p>
                  <p className="text-gray-800">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                  Reason
                </p>
                <div className="p-4 bg-gray-50 rounded border">
                  <p className="text-gray-700">{request.reason}</p>
                </div>
              </div>

              {request.status === "PENDING" && (
                <div className="mt-6">
                  <ActionButtons
                    requestId={request.id}
                    requestType={request.type}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Flight Info */}
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h6 className="text-[#4e73df] font-bold">Flight Details</h6>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                  flightStatus === "CANCELLED"
                    ? "bg-[#e74a3b]/10 text-[#e74a3b]"
                    : flightStatus === "DELAYED"
                    ? "bg-[#f6c23e]/10 text-[#f6c23e]"
                    : "bg-[#1cc88a]/10 text-[#1cc88a]"
                }`}
              >
                {flightStatus}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={request.ticket.flight.plane.image}
                  alt={request.ticket.flight.plane.name}
                  className="w-16 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-bold text-gray-800">
                    {request.ticket.flight.plane.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.ticket.flight.plane.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {request.ticket.flight.departureCityCode}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.ticket.flight.departureCity}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="w-full h-0.5 bg-gray-300"></div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {request.ticket.flight.destinationCityCode}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.ticket.flight.destinationCity}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Departure
                  </p>
                  <p className="text-gray-800">
                    {formatDate(request.ticket.flight.departureDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Arrival
                  </p>
                  <p className="text-gray-800">
                    {formatDate(request.ticket.flight.arrivalDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h6 className="text-[#4e73df] font-bold">Customer</h6>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4e73df] flex items-center justify-center text-white font-bold">
                  {request.ticket.customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {request.ticket.customer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.ticket.customer.email}
                  </p>
                </div>
              </div>
              {request.ticket.passenger && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                    Passenger
                  </p>
                  <p className="text-gray-800">
                    {request.ticket.passenger.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h6 className="text-[#4e73df] font-bold">Ticket Info</h6>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Ticket Code
                </p>
                <p className="font-mono text-lg text-[#4e73df]">
                  {request.ticket.code}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Seat
                </p>
                <p className="text-gray-800">
                  {request.ticket.seat.seatNumber} ({request.ticket.seat.type})
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Price
                </p>
                <p className="text-xl font-bold text-[#1cc88a]">
                  {formatCurrency(request.ticket.price)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Ticket Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                    request.ticket.status === "SUCCESS"
                      ? "bg-[#1cc88a]/10 text-[#1cc88a]"
                      : request.ticket.status === "PENDING"
                      ? "bg-[#f6c23e]/10 text-[#f6c23e]"
                      : "bg-[#e74a3b]/10 text-[#e74a3b]"
                  }`}
                >
                  {request.ticket.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
