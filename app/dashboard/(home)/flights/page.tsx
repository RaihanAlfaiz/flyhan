import Link from "next/link";
import { Plus } from "lucide-react";
import { getFlights } from "./lib/data";
import FlightList from "./components/flight-list";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";

export default async function FlightsPage() {
  const flights = await getFlights();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flights"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flights" },
        ]}
        actions={
          <Link href="/dashboard/flights/create">
            <Button startIcon={<Plus className="h-4 w-4" />}>Add Flight</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Flight Schedule</CardTitle>
        </CardHeader>
        <FlightList flights={flights as any} />
      </Card>
    </div>
  );
}
