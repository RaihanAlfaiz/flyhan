import { Ticket } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getTickets } from "./lib/data";

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tickets</h1>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">All Tickets</h6>
        </div>
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Tickets Yet
            </h3>
            <p className="text-sm text-gray-500">
              Tickets will appear after customers make bookings.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tickets as any}
            searchPlaceholder="Search tickets..."
          />
        )}
      </div>
    </div>
  );
}
