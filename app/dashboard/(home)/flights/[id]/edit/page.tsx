import { getAirplanesForSelect } from "../../lib/data";
import FormFlightEdit from "../../components/form-flight-edit";
import Link from "next/link";
import PageHeader from "../../../ui/page-header/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../ui/card/Card";
import Button from "../../../ui/button/Button";
import { ArrowLeft } from "lucide-react";

interface EditFlightPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFlightPage({ params }: EditFlightPageProps) {
  const { id } = await params;
  const airplanes = await getAirplanesForSelect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Flight"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flights", href: "/dashboard/flights" },
          { label: "Edit Flight" },
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
          <FormFlightEdit id={id} airplanes={airplanes} />
        </CardContent>
      </Card>
    </div>
  );
}
