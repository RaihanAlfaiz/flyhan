import { Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns-table";
import { getUsers } from "./lib/data";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Users
            </h1>
            <p className="text-sm text-gray-500">Kelola data pengguna</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "ADMIN").length}
            </p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-emerald-600">
              {users.filter((u) => u.role === "CUSTOMER").length}
            </p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Belum Ada User
          </h3>
          <p className="text-gray-500">
            User akan muncul setelah melakukan registrasi.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <DataTable columns={columns} data={users} />
        </div>
      )}
    </div>
  );
}
