import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getFlashSales } from "./lib/actions";

export default async function FlashSalesPage() {
  const flashSales = await getFlashSales();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash Sales"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Flash Sales" },
        ]}
        actions={
          <Link href="/dashboard/flash-sales/create">
            <Button startIcon={<Plus className="h-4 w-4" />}>
              Create Flash Sale
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Flash Sales</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={flashSales}
          searchPlaceholder="Search flash sales..."
        />
      </Card>
    </div>
  );
}
