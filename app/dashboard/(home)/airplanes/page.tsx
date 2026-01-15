import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getAirplanes } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";

export default async function AirplanePage() {
  const planes = await getAirplanes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Airplanes"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Airplanes" },
        ]}
        actions={
          <Link href="/dashboard/airplanes/create">
            <Button startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Airplane
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Airplane Data</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={planes}
          searchPlaceholder="Search airplanes..."
        />
      </Card>
    </div>
  );
}
