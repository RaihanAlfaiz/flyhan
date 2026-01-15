import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card/Card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getPackageOrders, getPackageOrderStats } from "./lib/actions";

export default async function PackageOrdersPage() {
  const [orders, stats] = await Promise.all([
    getPackageOrders(),
    getPackageOrderStats(),
  ]);

  const statCards = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: Package,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400",
    },
    {
      label: "Success",
      value: stats.success,
      icon: CheckCircle,
      color:
        "text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-gray-600 bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Package Orders"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Package Orders" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue (Success Orders)
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                Rp {Number(stats.totalRevenue).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={orders}
          searchPlaceholder="Search by order code..."
        />
      </Card>
    </div>
  );
}
