"use client";

import { PackageOrder, FlightPackage, User } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePackageOrder } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

type OrderWithRelations = PackageOrder & {
  package: FlightPackage;
  customer: Pick<User, "id" | "name" | "email">;
};

const DeleteButton = ({ id, code }: { id: string; code: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`order "${code}"`);

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deletePackageOrder(id);
      closeLoading();

      if (result?.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result?.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500 dark:hover:bg-red-500/25"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
};

const ViewButton = ({ id }: { id: string }) => {
  return (
    <Link
      href={`/dashboard/package-orders/${id}`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-500 dark:hover:bg-blue-500/25"
    >
      <Eye className="h-3.5 w-3.5" />
      View
    </Link>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    SUCCESS:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    CANCELLED:
      "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
};

export const columns: ColumnDef<OrderWithRelations>[] = [
  {
    accessorKey: "code",
    header: "Order Code",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-gray-800 dark:text-white/90">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "package",
    header: "Package",
    cell: ({ row }) => {
      const pkg = row.original.package;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 rounded overflow-hidden shrink-0">
            <img
              src={pkg.image}
              alt={pkg.title}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium text-gray-700 dark:text-white/80 line-clamp-1">
            {pkg.title}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {customer.name}
          </span>
          <span className="text-xs text-gray-500">{customer.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <span className="font-medium text-gray-700 dark:text-white/80">
        {row.getValue("quantity")} pax
      </span>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-white/90">
        Rp {Number(row.getValue("totalPrice")).toLocaleString("id-ID")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {new Date(row.getValue("orderDate")).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center gap-2">
          <ViewButton id={order.id} />
          <DeleteButton id={order.id} code={order.code} />
        </div>
      );
    },
  },
];
