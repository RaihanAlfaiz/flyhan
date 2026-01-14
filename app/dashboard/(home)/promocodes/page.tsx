import { PlusIcon, TicketPercent } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getPromoCodes } from "./lib/data";

export default async function PromoCodePage() {
  const promoCodes = await getPromoCodes();

  const activeCount = promoCodes.filter((p) => p.isActive).length;
  const inactiveCount = promoCodes.filter((p) => !p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Promo Codes</h1>
        <Link
          href="/dashboard/promocodes/create"
          className="inline-flex items-center gap-2 rounded bg-[#4e73df] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e59d9] transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Promo Code
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow border-l-4 border-l-[#4e73df] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#4e73df]">
                Total Codes
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {promoCodes.length}
              </p>
            </div>
            <TicketPercent className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#1cc88a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#1cc88a]">
                Active
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {activeCount}
              </p>
            </div>
            <TicketPercent className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#e74a3b] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#e74a3b]">
                Inactive
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {inactiveCount}
              </p>
            </div>
            <TicketPercent className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">All Promo Codes</h6>
        </div>
        <DataTable
          columns={columns}
          data={promoCodes}
          searchPlaceholder="Search promo codes..."
        />
      </div>
    </div>
  );
}
