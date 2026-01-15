import PageHeader from "../../ui/page-header/PageHeader";
import FormFlightAddon from "../components/form-flight-addon";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "../../ui/button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card/Card";

export default function CreateFlightAddonPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Flight Addon"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flight Addons", href: "/dashboard/flight-addons" },
          { label: "Create" },
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
          <FormFlightAddon />
        </CardContent>
      </Card>
    </div>
  );
}
