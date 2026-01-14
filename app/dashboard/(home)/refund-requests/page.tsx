import { getRefundRequests } from "./lib/data";
import { RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: bigint | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export default async function RefundRequestsPage() {
  const requests = await getRefundRequests();

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#f6c23e]/10 text-[#f6c23e] rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {pendingCount} pending requests
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded shadow border-l-4 border-l-[#4e73df] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#4e73df]">
                Total Requests
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {requests.length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#f6c23e] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#f6c23e]">
                Pending
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {pendingCount}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#1cc88a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#1cc88a]">
                Approved
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {approvedCount}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#e74a3b] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#e74a3b]">
                Rejected
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {rejectedCount}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">All Requests</h6>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No refund requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Flight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {request.ticket.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.ticket.customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-[#4e73df]">
                        {request.ticket.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {request.ticket.flight.departureCityCode} →{" "}
                          {request.ticket.flight.destinationCityCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.ticket.flight.plane.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          request.type === "REFUND"
                            ? "bg-[#e74a3b]/10 text-[#e74a3b]"
                            : "bg-[#36b9cc]/10 text-[#36b9cc]"
                        }`}
                      >
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">
                        {formatCurrency(request.ticket.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          request.status === "PENDING"
                            ? "bg-[#f6c23e]/10 text-[#f6c23e]"
                            : request.status === "APPROVED"
                            ? "bg-[#1cc88a]/10 text-[#1cc88a]"
                            : "bg-[#e74a3b]/10 text-[#e74a3b]"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/refund-requests/${request.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
