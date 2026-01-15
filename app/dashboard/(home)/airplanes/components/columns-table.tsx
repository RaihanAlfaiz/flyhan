"use client";

import { Airplane } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAirplane } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";

const DeleteButton = ({ id, name }: { id: string; name: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`airplane "${name}"`);

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deleteAirplane(id);
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

export const columns: ColumnDef<Airplane>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string;
      return (
        <div className="h-10 w-16 overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={row.getValue("name") as string}
            className="h-full w-full object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-white/90">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const plane = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/airplanes/${plane.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <DeleteButton id={plane.id} name={plane.name} />
        </div>
      );
    },
  },
];
