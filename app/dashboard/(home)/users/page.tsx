import { Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getUsers } from "./lib/data";

export default async function UsersPage() {
  const users = await getUsers();

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow border-l-4 border-l-[#4e73df] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#4e73df]">
                Total Users
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#1cc88a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#1cc88a]">
                Customers
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {customerCount}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded shadow border-l-4 border-l-[#f6c23e] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#f6c23e]">
                Admins
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {adminCount}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h6 className="text-[#4e73df] font-bold">All Users</h6>
        </div>
        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Users Yet
            </h3>
            <p className="text-sm text-gray-500">
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
      </div>
    </div>
  );
}
