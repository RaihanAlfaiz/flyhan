import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getFlightAddons } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";

export default async function FlightAddonsPage() {
  const addons = await getFlightAddons();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flight Addons"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flight Addons" },
        ]}
        actions={
          <Link href="/dashboard/flight-addons/create">
            <Button startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Addon
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Addon Data</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={addons}
          searchPlaceholder="Search addons..."
        />
      </Card>
    </div>
  );
}
