import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getPackages } from "./lib/actions";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Packages" },
        ]}
        actions={
          <Link href="/dashboard/packages/create">
            <Button startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Package
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Package Data</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={packages}
          searchPlaceholder="Search packages..."
        />
      </Card>
    </div>
  );
}
