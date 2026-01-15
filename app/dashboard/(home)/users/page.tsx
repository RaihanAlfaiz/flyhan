import { Users, Shield, UserCheck } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getUsers } from "./lib/data";
import PageHeader from "../ui/page-header/PageHeader";
import { Card, CardHeader, CardTitle } from "../ui/card/Card";
import MetricCard from "../ui/metric-card/MetricCard";

export default async function UsersPage() {
  const users = await getUsers();

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Users" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <MetricCard
          title="Total Users"
          value={users.length.toString()}
          icon={<Users className="text-gray-800 dark:text-white/90 w-6 h-6" />}
          iconBgColor="bg-brand-50 dark:bg-brand-500/15"
        />
        <MetricCard
          title="Customers"
          value={customerCount.toString()}
          icon={
            <UserCheck className="text-gray-800 dark:text-white/90 w-6 h-6" />
          }
          iconBgColor="bg-green-50 dark:bg-green-500/15"
        />
        <MetricCard
          title="Admins"
          value={adminCount.toString()}
          icon={<Shield className="text-gray-800 dark:text-white/90 w-6 h-6" />}
          iconBgColor="bg-amber-50 dark:bg-amber-500/15"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Users Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Users will appear after they register.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users..."
          />
        )}
      </Card>
    </div>
  );
}
