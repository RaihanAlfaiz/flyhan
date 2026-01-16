import { getAirplanesForSelect, getExistingCities } from "../lib/data";
import FormFlight from "../components/form-flight";
import Link from "next/link";
import PageHeader from "../../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card/Card";
import Button from "../../ui/button/Button";
import { ArrowLeft } from "lucide-react";

export default async function CreateFlightPage() {
  const [airplanes, existingCities] = await Promise.all([
    getAirplanesForSelect(),
    getExistingCities(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Flight"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flights", href: "/dashboard/flights" },
          { label: "Add Flight" },
        ]}
        actions={
          <Link href="/dashboard/flights">
            <Button
              variant="outline"
              startIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to List
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Flight Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFlight airplanes={airplanes} existingCities={existingCities} />
        </CardContent>
      </Card>
    </div>
  );
}
