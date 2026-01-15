"use client";

import { FlightPackage } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { deletePackage } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

const DeleteButton = ({ id, title }: { id: string; title: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`package "${title}"`);

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deletePackage(id);
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

const EditButton = ({ id }: { id: string }) => {
  return (
    <Link
      href={`/dashboard/packages/${id}/edit`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-500 dark:hover:bg-blue-500/25"
    >
      <Pencil className="h-3.5 w-3.5" />
      Edit
    </Link>
  );
};

export const columns: ColumnDef<FlightPackage>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string;
      return (
        <div className="h-10 w-16 overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={row.getValue("title") as string}
            className="h-full w-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-white/90">
        {row.getValue("title")}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-white/90">
        Rp {(row.getValue("price") as number).toLocaleString("id-ID")}
      </span>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.getValue("features") as string[];
      return (
        <span className="font-medium text-gray-500 text-sm">
          {features?.length || 0} items
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const pkg = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditButton id={pkg.id} />
          <DeleteButton id={pkg.id} title={pkg.title} />
        </div>
      );
    },
  },
];
