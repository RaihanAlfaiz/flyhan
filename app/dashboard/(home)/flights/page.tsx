import Link from "next/link";
import { Plus } from "lucide-react";
import { getFlights } from "./lib/data";
import FlightList from "./components/flight-list";

export default async function FlightsPage() {
  const flights = await getFlights();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Flights</h1>
        <Link
          href="/dashboard/flights/create"
          className="inline-flex items-center gap-2 rounded bg-[#4e73df] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e59d9] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Flight
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">Flight Schedule</h6>
        </div>
        <FlightList flights={flights as any} />
      </div>
    </div>
  );
}
