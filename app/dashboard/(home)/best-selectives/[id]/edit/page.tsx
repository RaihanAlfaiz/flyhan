import PageHeader from "../../../ui/page-header/PageHeader";
import FormBestSelective from "../../components/form-best-selective";
import { getBestSelectiveById } from "../../lib/data";
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

export default async function EditBestSelectivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBestSelectiveById(id);

  if (!data) {
    redirect("/dashboard/best-selectives");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Best Selective"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Best Selectives", href: "/dashboard/best-selectives" },
          { label: "Edit" },
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
          <FormBestSelective data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
