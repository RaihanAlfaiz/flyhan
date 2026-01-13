import { Button } from "@/components/ui/button";
import { PlusIcon, Plane } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getAirplanes } from "./lib/data";

export default async function AirplanePage() {
  const planes = await getAirplanes();
  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Airplanes
            </h1>
            <p className="text-sm text-gray-500">Kelola data pesawat</p>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
        >
          <Link href="/dashboard/airplanes/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Airplane
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable columns={columns} data={planes} />
      </div>
    </div>
  );
}
