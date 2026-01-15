import PageHeader from "../../../ui/page-header/PageHeader";
import FormFlightAddon from "../../components/form-flight-addon";
import { getFlightAddonById } from "../../lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "../../../ui/button/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../ui/card/Card";

export default async function EditFlightAddonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const addon = await getFlightAddonById(id);

  if (!addon) {
    redirect("/dashboard/flight-addons");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Flight Addon"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flight Addons", href: "/dashboard/flight-addons" },
          { label: "Edit" },
        ]}
        actions={
          <Link href="/dashboard/flight-addons">
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
          <CardTitle>Addon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFlightAddon data={addon} />
        </CardContent>
      </Card>
    </div>
  );
}
