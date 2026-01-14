"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePromoCode } from "../lib/actions";

export const columns: ColumnDef<PromoCode>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-[#4e73df]/10 text-[#4e73df]">
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
        <span className="font-medium text-gray-800">
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
          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
            isActive
              ? "bg-[#1cc88a]/10 text-[#1cc88a]"
              : "bg-[#e74a3b]/10 text-[#e74a3b]"
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
      if (!validUntil) return <span className="text-gray-400">-</span>;

      const isExpired = new Date(validUntil) < new Date();
      return (
        <span className={isExpired ? "text-[#e74a3b]" : "text-gray-600"}>
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
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <form action={deletePromoCode.bind(null, promo.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </form>
        </div>
      );
    },
  },
];
