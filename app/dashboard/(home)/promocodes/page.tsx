import { PlusIcon, TicketPercent, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getPromoCodes } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import Button from "../ui/button/Button";
import MetricCard from "../ui/metric-card/MetricCard";

export default async function PromoCodePage() {
  const promoCodes = await getPromoCodes();

  const activeCount = promoCodes.filter((p) => p.isActive).length;
  const inactiveCount = promoCodes.filter((p) => !p.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Codes"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Promo Codes" },
        ]}
        actions={
          <Link href="/dashboard/promocodes/create">
            <Button startIcon={<PlusIcon className="h-4 w-4" />}>
              Add Promo Code
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <MetricCard
          title="Total Codes"
          value={promoCodes.length.toString()}
          icon={
            <TicketPercent className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-brand-50 dark:bg-brand-500/15"
        />
        <MetricCard
          title="Active"
          value={activeCount.toString()}
          icon={
            <CheckCircle className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-green-50 dark:bg-green-500/15"
        />
        <MetricCard
          title="Inactive"
          value={inactiveCount.toString()}
          icon={
            <XCircle className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-red-50 dark:bg-red-500/15"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={promoCodes}
          searchPlaceholder="Search promo codes..."
        />
      </Card>
    </div>
  );
}
