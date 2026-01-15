import FormPromoCode from "../components/form-promo-code";
import Link from "next/link";
import PageHeader from "../../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card/Card";
import Button from "../../ui/button/Button";
import { ArrowLeft } from "lucide-react";

export default function CreatePromoCodePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Promo Code"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Promo Codes", href: "/dashboard/promocodes" },
          { label: "Add Promo Code" },
        ]}
        actions={
          <Link href="/dashboard/promocodes">
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
          <CardTitle>Promo Code Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormPromoCode type="ADD" />
        </CardContent>
      </Card>
    </div>
  );
}
