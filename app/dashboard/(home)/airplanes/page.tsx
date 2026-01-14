import { PlusIcon, Plane } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getAirplanes } from "./lib/data";

export default async function AirplanePage() {
  const planes = await getAirplanes();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Airplanes</h1>
        <Link
          href="/dashboard/airplanes/create"
          className="inline-flex items-center gap-2 rounded bg-[#4e73df] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e59d9] transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Airplane
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">Airplane Data</h6>
        </div>
        <DataTable
          columns={columns}
          data={planes}
          searchPlaceholder="Search airplanes..."
        />
      </div>
    </div>
  );
}
