"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BestSelective } from "@prisma/client";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { deleteBestSelective } from "../lib/actions";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<BestSelective>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image;
      return (
        <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-100">
          <Image src={image} alt="Thumbnail" fill className="object-cover" />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "subtitle",
    header: "Subtitle",
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm truncate max-w-[150px] block">
        {row.original.url || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2 justify-end items-center">
          <Link href={`/dashboard/best-selectives/${item.id}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteButton id={item.id} />
        </div>
      );
    },
  },
];

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={isPending}
      title="Delete"
      onClick={(e) => {
        e.preventDefault();
        if (confirm("Delete this item?")) {
          startTransition(async () => {
            await deleteBestSelective(id);
          });
        }
      }}
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
}
