"use client";

import { Airplane } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { deleteAirplane } from "../lib/actions";
import { useRouter } from "next/navigation";

const DeleteButton = ({ id }: { id: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus pesawat ini?")) {
      const result = await deleteAirplane(id);
      if (result.successTitle) {
        router.refresh();
      } else if (result.errorTitle) {
        alert(result.errorDesc);
      }
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2Icon className="h-4 w-4" />
    </Button>
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
          className="h-12 w-16 object-cover rounded-md"
        />
      );
    },
  },

  {
    accessorKey: "name",
    header: "Name",
  },

  {
    accessorKey: "code",
    header: "Code",
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const plane = row.original;
      return (
        <div className="flex flex-row items-center justify-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/dashboard/airplanes/${plane.id}/edit`}>
              <PencilIcon className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteButton id={plane.id} />
        </div>
      );
    },
  },
];
