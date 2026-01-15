"use client";

import { useParams } from "next/navigation";
import FormAirplaneEdit from "../../components/form-airplane-edit";
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

export default function EditAirplanePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Airplane"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Airplanes", href: "/dashboard/airplanes" },
          { label: "Edit Airplane" },
        ]}
        actions={
          <Link href="/dashboard/airplanes">
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
          <CardTitle>Airplane Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormAirplaneEdit id={id} />
        </CardContent>
      </Card>
    </div>
  );
}
