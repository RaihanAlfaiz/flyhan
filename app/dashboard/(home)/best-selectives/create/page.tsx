import PageHeader from "../../ui/page-header/PageHeader";
import FormBestSelective from "../components/form-best-selective";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "../../ui/button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card/Card";

export default function CreateBestSelectivePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Best Selective"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Best Selectives", href: "/dashboard/best-selectives" },
          { label: "Create" },
        ]}
        actions={
          <Link href="/dashboard/best-selectives">
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
          <CardTitle>Selective Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormBestSelective />
        </CardContent>
      </Card>
    </div>
  );
}
