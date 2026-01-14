import { Ticket } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getTickets } from "./lib/data";

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tickets
            </h1>
            <p className="text-sm text-gray-500">Kelola tiket penerbangan</p>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Ticket className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Belum Ada Tiket
          </h3>
          <p className="text-gray-500">
            Tiket akan muncul setelah customer melakukan pemesanan.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <DataTable columns={columns} data={tickets as any} />
        </div>
      )}
    </div>
  );
}
