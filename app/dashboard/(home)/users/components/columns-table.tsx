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
    ADMIN: {
      bg: "bg-amber-50 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-500",
    },
    CUSTOMER: {
      bg: "bg-brand-50 dark:bg-brand-500/15",
      text: "text-brand-600 dark:text-brand-400",
    },
  };

  const { bg, text } = config[role];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
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
      confirmButtonColor: "#465fff",
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
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
      >
        <Shield className="h-3.5 w-3.5" />
        Role
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500 dark:hover:bg-red-500/25"
      >
        <Trash2 className="h-3.5 w-3.5" />
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
        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800 dark:text-white/90">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-400">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "passport",
    header: "Passport",
    cell: ({ row }) => {
      const passport = row.getValue("passport") as string | null;
      return passport ? (
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {passport}
        </span>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">-</span>
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
            count > 0
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-400 dark:text-gray-500"
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
