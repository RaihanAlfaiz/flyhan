import FormPromoCode from "../../components/form-promo-code";
import { getPromoCodeById } from "../../lib/data";
import { redirect } from "next/navigation";
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

interface EditPromoCodePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPromoCodePage({
  params,
}: EditPromoCodePageProps) {
  const { id } = await params;
  const promoCode = await getPromoCodeById(id);

  if (!promoCode) {
    redirect("/dashboard/promocodes");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Promo Code"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Promo Codes", href: "/dashboard/promocodes" },
          { label: "Edit Promo Code" },
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
          <FormPromoCode type="EDIT" defaultValues={promoCode} />
        </CardContent>
      </Card>
    </div>
  );
}
