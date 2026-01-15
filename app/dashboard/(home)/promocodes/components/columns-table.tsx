"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePromoCode } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

const DeleteButton = ({ id, code }: { id: string; code: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`promo code "${code}"`);

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deletePromoCode(id);
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
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500 dark:hover:bg-red-500/25"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
};

export const columns: ColumnDef<PromoCode>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const value = Number(row.getValue("discount"));
      return (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
              : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    cell: ({ row }) => {
      const validUntil = row.getValue("validUntil") as Date | null;
      if (!validUntil)
        return <span className="text-gray-400 dark:text-gray-500">-</span>;

      const isExpired = new Date(validUntil) < new Date();
      return (
        <span
          className={
            isExpired
              ? "text-red-600 dark:text-red-500"
              : "text-gray-600 dark:text-gray-400"
          }
        >
          {new Date(validUntil).toLocaleDateString("id-ID")}
          {isExpired && " (Expired)"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const promo = row.original;

      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/promocodes/edit/${promo.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <DeleteButton id={promo.id} code={promo.code} />
        </div>
      );
    },
  },
];
