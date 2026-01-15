import FormPackage from "../components/form-package";
import Link from "next/link";
import PageHeader from "../../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card/Card";
import Button from "../../ui/button/Button";
import { ArrowLeft } from "lucide-react";

export default function CreatePackagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Package"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Packages", href: "/dashboard/packages" },
          { label: "Create Package" },
        ]}
        actions={
          <Link href="/dashboard/packages">
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
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormPackage />
        </CardContent>
      </Card>
    </div>
  );
}
