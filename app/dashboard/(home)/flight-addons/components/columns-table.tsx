"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FlightAddon } from "@prisma/client";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { deleteFlightAddon } from "../lib/actions";

import { Button } from "@/components/ui/button";

// Helper IDR format
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const columns: ColumnDef<FlightAddon>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const addon = row.original;

      return (
        <div className="flex gap-2 justify-end items-center">
          <Link href={`/dashboard/flight-addons/${addon.id}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteAddonItem id={addon.id} />
        </div>
      );
    },
  },
];

function DeleteAddonItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this addon?")) {
          startTransition(async () => {
            await deleteFlightAddon(id);
          });
        }
      }}
      title="Delete"
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
}
