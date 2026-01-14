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
import { Button } from "@/components/ui/button";
import { Trash2Icon, CheckCircle, XCircle, Clock, Plane } from "lucide-react";
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
  return new Intl.NumberFormat("id-ID").format(Number(price));
}

const StatusBadge = ({ status }: { status: StatusTicket }) => {
  const config = {
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
    },
    SUCCESS: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle,
    },
    FAILED: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
    },
  };

  const { bg, text, border, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

const SeatTypeBadge = ({ type }: { type: string }) => {
  const config: Record<string, { bg: string; text: string }> = {
    ECONOMY: { bg: "bg-emerald-100", text: "text-emerald-700" },
    BUSINESS: { bg: "bg-blue-100", text: "text-blue-700" },
    FIRST: { bg: "bg-amber-100", text: "text-amber-700" },
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
      title: "Ubah Status Tiket",
      input: "select",
      inputOptions: {
        PENDING: "Pending",
        SUCCESS: "Success",
        FAILED: "Failed/Cancelled",
      },
      inputValue: ticket.status,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      inputValidator: (value) => {
        if (!value) {
          return "Pilih status!";
        }
        return null;
      },
    });

    if (newStatus && newStatus !== ticket.status) {
      showLoading("Mengupdate status...");
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
    const confirmed = await showConfirmDelete(`tiket ${ticket.code}`);

    if (confirmed) {
      showLoading("Menghapus tiket...");
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
      <Button
        variant="outline"
        size="sm"
        onClick={handleStatusChange}
        className="text-xs"
      >
        Status
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<TicketWithRelations>[] = [
  {
    accessorKey: "code",
    header: () => (
      <span className="font-semibold text-gray-700">Kode Tiket</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-blue-600">
        {row.getValue("code")}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: () => <span className="font-semibold text-gray-700">Customer</span>,
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
    header: () => (
      <span className="font-semibold text-gray-700">Penerbangan</span>
    ),
    cell: ({ row }) => {
      const flight = row.original.flight;
      return (
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-blue-500" />
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
    header: () => <span className="font-semibold text-gray-700">Kursi</span>,
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
    header: () => <span className="font-semibold text-gray-700">Harga</span>,
    cell: ({ row }) => (
      <span className="font-semibold text-emerald-600">
        Rp {formatPrice(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-gray-700">Status</span>,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "bookingDate",
    header: () => (
      <span className="font-semibold text-gray-700">Tanggal Booking</span>
    ),
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm">
        {formatDate(row.original.bookingDate)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="font-semibold text-gray-700">Aksi</span>,
    cell: ({ row }) => <ActionButtons ticket={row.original} />,
  },
];
