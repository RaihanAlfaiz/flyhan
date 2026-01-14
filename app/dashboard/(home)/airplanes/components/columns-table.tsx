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
      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
    >
      <Trash2 className="h-3 w-3" />
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
        <img
          src={imageUrl}
          alt={row.getValue("name") as string}
          className="h-10 w-16 object-cover rounded"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#4e73df]/10 text-[#4e73df]">
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
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <DeleteButton id={plane.id} name={plane.name} />
        </div>
      );
    },
  },
];
