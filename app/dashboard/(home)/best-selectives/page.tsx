import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getBestSelectives } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";

export default async function BestSelectivesPage() {
  const data = await getBestSelectives();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Best Selectives"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Best Selectives" },
        ]}
        actions={
          <Link href="/dashboard/best-selectives/create">
            <Button startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Item
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Selective Items</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search selectives..."
        />
      </Card>
    </div>
  );
}
