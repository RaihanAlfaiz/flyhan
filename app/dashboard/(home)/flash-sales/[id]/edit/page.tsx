"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../../ui/page-header/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../ui/card/Card";
import Button from "../../../ui/button/Button";
import FormFlashSaleEdit from "./components/form-flash-sale-edit";

export default function EditFlashSalePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Flash Sale"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flash Sales", href: "/dashboard/flash-sales" },
          { label: "Edit" },
        ]}
        actions={
          <Link href="/dashboard/flash-sales">
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
          <CardTitle>Flash Sale Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFlashSaleEdit id={id} />
        </CardContent>
      </Card>
    </div>
  );
}
