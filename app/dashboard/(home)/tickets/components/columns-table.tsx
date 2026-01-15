"use client";

import type {
  Ticket,
  Flight,
  Airplane,
  FlightSeat,
  User,
  StatusTicket,
  TicketAddon,
  FlightAddon,
} from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Plane, RefreshCw, Info } from "lucide-react";
import { deleteTicket, updateTicketStatus } from "../lib/actions";
import { useRouter } from "next/navigation";
import {
  showConfirmDelete,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import Swal from "sweetalert2";

interface TicketWithRelations extends Ticket {
  flight: Flight & { plane: Airplane };
  customer: Pick<User, "id" | "name" | "email">;
  seat: FlightSeat;
  addons: (TicketAddon & { flightAddon: FlightAddon })[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: bigint | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(price));
}

const StatusBadge = ({ status }: { status: StatusTicket }) => {
  const config = {
    PENDING: {
      bg: "bg-amber-50 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
    },
    SUCCESS: {
      bg: "bg-green-50 dark:bg-green-500/15",
      text: "text-green-600 dark:text-green-500",
    },
    FAILED: {
      bg: "bg-red-50 dark:bg-red-500/15",
      text: "text-red-600 dark:text-red-500",
    },
  };

  const { bg, text } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {status}
    </span>
  );
};

const SeatTypeBadge = ({ type }: { type: string }) => {
  const config: Record<string, { bg: string; text: string }> = {
    ECONOMY: {
      bg: "bg-green-50 dark:bg-green-500/15",
      text: "text-green-600 dark:text-green-500",
    },
    BUSINESS: {
      bg: "bg-brand-50 dark:bg-brand-500/15",
      text: "text-brand-600 dark:text-brand-400",
    },
    FIRST: {
      bg: "bg-amber-50 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
    },
  };

  const { bg, text } = config[type] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {type}
    </span>
  );
};

const ActionButtons = ({ ticket }: { ticket: TicketWithRelations }) => {
  const router = useRouter();

  const handleStatusChange = async () => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Ticket Status",
      input: "select",
      inputOptions: {
        PENDING: "Pending",
        SUCCESS: "Success",
        FAILED: "Failed/Cancelled",
      },
      inputValue: ticket.status,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#465fff",
      inputValidator: (value) => {
        if (!value) return "Select a status!";
        return null;
      },
    });

    if (newStatus && newStatus !== ticket.status) {
      showLoading("Updating status...");
      const result = await updateTicketStatus(
        ticket.id,
        newStatus as StatusTicket
      );
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.refresh();
      } else if (result.errorTitle) {
        showError(result.errorTitle, result.errorDesc || undefined);
      }
    }
  };

  const handleViewDetails = () => {
    const addons = ticket.addons;
    const hasAddons = addons && addons.length > 0;

    const itemsHtml = hasAddons
      ? addons
          .map(
            (a) => `
        <li class="mb-3 border-b pb-2 last:border-0">
            <div class="font-bold text-gray-800 text-base">${
              a.flightAddon.title
            }</div>
            <div class="text-sm text-gray-500 mt-1">Note: <span class="italic text-gray-700">${
              a.requestDetail || "-"
            }</span></div>
        </li>
    `
          )
          .join("")
      : "<p class='text-gray-500 italic'>No additional services requested.</p>";

    Swal.fire({
      title: `<span class="text-xl font-bold">Ticket Details</span>`,
      html: `
        <div class="text-left px-4">
            <div class="mb-4">
                <span class="block text-xs uppercase text-gray-400 font-semibold mb-1">Add-ons & Requests</span>
                <ul class="list-none m-0 p-0 text-left">
                    ${itemsHtml}
                </ul>
            </div>
        </div>
      `,
      width: 500,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`ticket ${ticket.code}`);

    if (confirmed) {
      showLoading("Deleting ticket...");
      const result = await deleteTicket(ticket.id);
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
    <div className="flex items-center gap-2">
      <button
        onClick={handleViewDetails}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          ticket.addons && ticket.addons.length > 0
            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:hover:bg-indigo-500/25 ring-1 ring-indigo-500/20"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
      >
        <Info
          className={`h-3.5 w-3.5 ${
            ticket.addons && ticket.addons.length > 0 ? "fill-current" : ""
          }`}
        />
        {ticket.addons && ticket.addons.length > 0 ? "Requests" : "Details"}
      </button>
      <button
        onClick={handleStatusChange}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Status
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-500 dark:hover:bg-red-500/25"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
};

export const columns: ColumnDef<TicketWithRelations>[] = [
  {
    accessorKey: "code",
    header: "Ticket Code",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-brand-500 dark:text-brand-400">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {customer.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {customer.email}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "flight",
    header: "Flight",
    cell: ({ row }) => {
      const flight = row.original.flight;
      return (
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-brand-500" />
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">
              {flight.departureCityCode} → {flight.destinationCityCode}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {flight.plane.name} • {formatDate(flight.departureDate)}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "seat",
    header: "Seat",
    cell: ({ row }) => {
      const seat = row.original.seat;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gray-800 dark:text-white/90">
            {seat.seatNumber}
          </span>
          <SeatTypeBadge type={seat.type} />
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-white/90">
        {formatPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "bookingDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm dark:text-gray-400">
        {formatDate(row.original.bookingDate)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionButtons ticket={row.original} />,
  },
];
