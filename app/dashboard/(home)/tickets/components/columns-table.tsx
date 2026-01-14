"use client";

import type {
  Ticket,
  Flight,
  Airplane,
  FlightSeat,
  User,
  StatusTicket,
} from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Plane, RefreshCw } from "lucide-react";
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
    PENDING: { bg: "bg-[#f6c23e]/10", text: "text-[#f6c23e]" },
    SUCCESS: { bg: "bg-[#1cc88a]/10", text: "text-[#1cc88a]" },
    FAILED: { bg: "bg-[#e74a3b]/10", text: "text-[#e74a3b]" },
  };

  const { bg, text } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
    >
      {status}
    </span>
  );
};

const SeatTypeBadge = ({ type }: { type: string }) => {
  const config: Record<string, { bg: string; text: string }> = {
    ECONOMY: { bg: "bg-[#1cc88a]/10", text: "text-[#1cc88a]" },
    BUSINESS: { bg: "bg-[#4e73df]/10", text: "text-[#4e73df]" },
    FIRST: { bg: "bg-[#f6c23e]/10", text: "text-[#f6c23e]" },
  };

  const { bg, text } = config[type] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
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
      confirmButtonColor: "#4e73df",
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
        onClick={handleStatusChange}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded transition-colors"
      >
        <RefreshCw className="h-3 w-3" />
        Status
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
      >
        <Trash2 className="h-3 w-3" />
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
      <span className="font-mono font-bold text-[#4e73df]">
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
          <p className="font-medium text-gray-800">{customer.name}</p>
          <p className="text-xs text-gray-500">{customer.email}</p>
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
          <Plane className="h-4 w-4 text-[#4e73df]" />
          <div>
            <p className="font-medium text-gray-800">
              {flight.departureCityCode} → {flight.destinationCityCode}
            </p>
            <p className="text-xs text-gray-500">
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
          <span className="font-mono font-bold">{seat.seatNumber}</span>
          <SeatTypeBadge type={seat.type} />
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800">
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
    header: "Booking Date",
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm">
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
