import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getAirplanes } from "./lib/data";

export default async function AirplanePage() {
  const planes = await getAirplanes();
  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <h1 className="my-5 text-2xl font-bold">Airplanes</h1>
        <Button asChild>
          <Link href="/dashboard/airplanes/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Airplane
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={planes} />
    </div>
  );
}
