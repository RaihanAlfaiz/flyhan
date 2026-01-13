import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Plane } from "lucide-react";
import { getFlights } from "./lib/data";
import FlightList from "./components/flight-list";

export default async function FlightsPage() {
  const flights = await getFlights();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Flights
            </h1>
            <p className="text-sm text-gray-500">Kelola data penerbangan</p>
          </div>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-6"
        >
          <Link href="/dashboard/flights/create">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Link>
        </Button>
      </div>

      <FlightList flights={flights as any} />
    </div>
  );
}
