"use client";

import { FlashSale, Flight, Airplane } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { deleteFlashSale, toggleFlashSaleStatus } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

type FlashSaleWithRelations = FlashSale & {
  flight: Flight & { plane: Airplane };
};

const DeleteButton = ({ id, title }: { id: string; title: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`flash sale "${title}"`);
    if (confirmed) {
      showLoading("Deleting...");
      const result = await deleteFlashSale(id);
      closeLoading();
      if (result?.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else {
        showError(result.errorTitle || "Error", result.errorDesc || undefined);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
};

const ToggleButton = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const router = useRouter();

  const handleToggle = async () => {
    showLoading("Updating...");
    const result = await toggleFlashSaleStatus(id, !isActive);
    closeLoading();
    if (result?.successTitle) {
      await showSuccess(result.successTitle, result.successDesc || undefined);
      router.refresh();
    } else {
      showError(result.errorTitle || "Error", result.errorDesc || undefined);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        isActive
          ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/15 dark:text-green-400"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      {isActive ? (
        <ToggleRight className="h-4 w-4" />
      ) : (
        <ToggleLeft className="h-4 w-4" />
      )}
    </button>
  );
};

const StatusBadge = ({ sale }: { sale: FlashSaleWithRelations }) => {
  const now = new Date();
  const start = new Date(sale.startDate);
  const end = new Date(sale.endDate);

  let status = "Scheduled";
  let color =
    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400";

  if (!sale.isActive) {
    status = "Inactive";
    color = "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400";
  } else if (now >= start && now <= end) {
    status = "Live";
    color =
      "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400";
  } else if (now > end) {
    status = "Ended";
    color = "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
};

export const columns: ColumnDef<FlashSaleWithRelations>[] = [
  {
    accessorKey: "title",
    header: "Flash Sale",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="flex items-center gap-3">
          {sale.image && (
            <div className="h-10 w-14 rounded-lg overflow-hidden shrink-0">
              <img
                src={sale.image}
                alt={sale.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <span className="font-medium text-gray-800 dark:text-white/90 block">
              {sale.title}
            </span>
            <span className="text-xs text-gray-500">
              {sale.flight.departureCity} → {sale.flight.destinationCity}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "discountPercent",
    header: "Discount",
    cell: ({ row }) => (
      <span className="font-bold text-red-500">
        {row.getValue("discountPercent")}% OFF
      </span>
    ),
  },
  {
    accessorKey: "maxQuota",
    header: "Quota",
    cell: ({ row }) => {
      const sale = row.original;
      const remaining = sale.maxQuota - sale.soldCount;
      return (
        <div className="text-sm">
          <span className="font-medium">{remaining}</span>
          <span className="text-gray-500">/{sale.maxQuota}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Period",
    cell: ({ row }) => {
      const sale = row.original;
      const formatDate = (d: Date) =>
        new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(sale.startDate)} - {formatDate(sale.endDate)}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge sale={row.original} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="flex items-center gap-2">
          <ToggleButton id={sale.id} isActive={sale.isActive} />
          <Link
            href={`/dashboard/flash-sales/${sale.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-500"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <DeleteButton id={sale.id} title={sale.title} />
        </div>
      );
    },
  },
];
