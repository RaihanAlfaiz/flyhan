"use client";

import { Airplane } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
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
    const confirmed = await showConfirmDelete(`pesawat "${name}"`);

    if (confirmed) {
      showLoading("Menghapus data...");
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
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
    >
      <Trash2Icon className="h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<Airplane>[] = [
  {
    accessorKey: "image",
    header: () => <span className="font-semibold text-gray-700">Image</span>,
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string;
      return (
        <div className="relative group">
          <img
            src={imageUrl}
            alt={row.getValue("name") as string}
            className="h-14 w-20 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    },
  },

  {
    accessorKey: "name",
    header: () => <span className="font-semibold text-gray-700">Name</span>,
    cell: ({ row }) => (
      <span className="font-medium text-gray-800">{row.getValue("name")}</span>
    ),
  },

  {
    accessorKey: "code",
    header: () => <span className="font-semibold text-gray-700">Code</span>,
    cell: ({ row }) => (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
        {row.getValue("code")}
      </span>
    ),
  },

  {
    id: "actions",
    header: () => <span className="font-semibold text-gray-700">Actions</span>,
    cell: ({ row }) => {
      const plane = row.original;
      return (
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Link href={`/dashboard/airplanes/${plane.id}/edit`}>
              <PencilIcon className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteButton id={plane.id} name={plane.name} />
        </div>
      );
    },
  },
];
