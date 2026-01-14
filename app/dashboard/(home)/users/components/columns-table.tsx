"use client";

import type { RoleUser } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Shield, User } from "lucide-react";
import { deleteUser, updateUserRole } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import Swal from "sweetalert2";

interface UserWithCount {
  id: string;
  name: string;
  email: string;
  passport: string | null;
  role: RoleUser;
  _count: {
    tickets: number;
  };
}

const RoleBadge = ({ role }: { role: RoleUser }) => {
  const config = {
    ADMIN: { bg: "bg-[#f6c23e]/10", text: "text-[#f6c23e]" },
    CUSTOMER: { bg: "bg-[#4e73df]/10", text: "text-[#4e73df]" },
  };

  const { bg, text } = config[role];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
    >
      {role === "ADMIN" ? (
        <Shield className="h-3 w-3" />
      ) : (
        <User className="h-3 w-3" />
      )}
      {role}
    </span>
  );
};

const ActionButtons = ({ user }: { user: UserWithCount }) => {
  const router = useRouter();

  const handleRoleChange = async () => {
    const { value: newRole } = await Swal.fire({
      title: "Change User Role",
      html: `<p class="text-gray-600 mb-2">User: <strong>${user.name}</strong></p>`,
      input: "select",
      inputOptions: {
        CUSTOMER: "Customer",
        ADMIN: "Admin",
      },
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4e73df",
      inputValidator: (value) => {
        if (!value) return "Select a role!";
        return null;
      },
    });

    if (newRole && newRole !== user.role) {
      showLoading("Updating role...");
      const result = await updateUserRole(user.id, newRole as RoleUser);
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`user "${user.name}"`);

    if (confirmed) {
      showLoading("Deleting user...");
      const result = await deleteUser(user.id);
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRoleChange}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
      >
        <Shield className="h-3 w-3" />
        Role
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>
    </div>
  );
};

export const columns: ColumnDef<UserWithCount>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#4e73df] flex items-center justify-center text-white font-bold text-sm">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "passport",
    header: "Passport",
    cell: ({ row }) => {
      const passport = row.getValue("passport") as string | null;
      return passport ? (
        <span className="font-mono text-gray-700">{passport}</span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  {
    accessorKey: "_count",
    header: "Tickets",
    cell: ({ row }) => {
      const count = row.original._count.tickets;
      return (
        <span
          className={`font-semibold ${
            count > 0 ? "text-[#4e73df]" : "text-gray-400"
          }`}
        >
          {count}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionButtons user={row.original} />,
  },
];
