"use client";

import type { RoleUser } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Trash2Icon,
  Shield,
  User,
  Mail,
  CreditCard,
  Ticket,
} from "lucide-react";
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
      bg: "bg-gradient-to-r from-purple-500 to-indigo-500",
      text: "text-white",
      icon: Shield,
    },
    CUSTOMER: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: User,
    },
  };

  const { bg, text, icon: Icon } = config[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}
    >
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
};

const ActionButtons = ({ user }: { user: UserWithCount }) => {
  const router = useRouter();

  const handleRoleChange = async () => {
    const { value: newRole } = await Swal.fire({
      title: "Ubah Role User",
      html: `<p class="text-gray-600 mb-2">User: <strong>${user.name}</strong></p>`,
      input: "select",
      inputOptions: {
        CUSTOMER: "Customer",
        ADMIN: "Admin",
      },
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Batal",
      confirmButtonColor: "#6366f1",
      inputValidator: (value) => {
        if (!value) {
          return "Pilih role!";
        }
        return null;
      },
    });

    if (newRole && newRole !== user.role) {
      showLoading("Mengupdate role...");
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
      showLoading("Menghapus user...");
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
      <Button
        variant="outline"
        size="sm"
        onClick={handleRoleChange}
        className="text-xs"
      >
        <Shield className="h-3 w-3 mr-1" />
        Role
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<UserWithCount>[] = [
  {
    accessorKey: "name",
    header: () => <span className="font-semibold text-gray-700">Nama</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
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
    header: () => (
      <span className="font-semibold text-gray-700 flex items-center gap-1">
        <Mail className="h-4 w-4" />
        Email
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "passport",
    header: () => (
      <span className="font-semibold text-gray-700 flex items-center gap-1">
        <CreditCard className="h-4 w-4" />
        Passport
      </span>
    ),
    cell: ({ row }) => {
      const passport = row.getValue("passport") as string | null;
      return passport ? (
        <span className="font-mono text-gray-700">{passport}</span>
      ) : (
        <span className="text-gray-400 italic">-</span>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <span className="font-semibold text-gray-700">Role</span>,
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  {
    accessorKey: "_count",
    header: () => (
      <span className="font-semibold text-gray-700 flex items-center gap-1">
        <Ticket className="h-4 w-4" />
        Tiket
      </span>
    ),
    cell: ({ row }) => {
      const count = row.original._count.tickets;
      return (
        <span
          className={`font-semibold ${
            count > 0 ? "text-blue-600" : "text-gray-400"
          }`}
        >
          {count} tiket
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="font-semibold text-gray-700">Aksi</span>,
    cell: ({ row }) => <ActionButtons user={row.original} />,
  },
];
