"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, deletePackageOrder } from "../../lib/actions";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  showConfirmDelete,
} from "@/lib/sweetalert";
import { PackageOrder, FlightPackage, User } from "@prisma/client";
import Image from "next/image";
import {
  User as UserIcon,
  Mail,
  CreditCard,
  Calendar,
  Package,
  Users,
  MessageSquare,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

type OrderWithRelations = PackageOrder & {
  package: FlightPackage;
  customer: Pick<User, "id" | "name" | "email" | "passport">;
};

interface OrderDetailContentProps {
  order: OrderWithRelations;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: {
      color:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30",
      icon: Clock,
    },
    SUCCESS: {
      color:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
      icon: CheckCircle,
    },
    FAILED: {
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
      icon: AlertTriangle,
    },
    CANCELLED: {
      color:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
      icon: XCircle,
    },
  };

  const { color, icon: Icon } =
    config[status as keyof typeof config] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${color}`}
    >
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
};

export default function OrderDetailContent({ order }: OrderDetailContentProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (
    newStatus: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED"
  ) => {
    setIsUpdating(true);
    showLoading("Updating status...");

    const result = await updateOrderStatus(order.id, newStatus);
    closeLoading();
    setIsUpdating(false);

    if (result.successTitle) {
      await showSuccess(result.successTitle, result.successDesc || undefined);
      router.refresh();
    } else {
      showError(result.errorTitle || "Error", result.errorDesc || undefined);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmDelete(`order "${order.code}"`);

    if (confirmed) {
      showLoading("Deleting...");
      const result = await deletePackageOrder(order.id);
      closeLoading();

      if (result.successTitle) {
        await showSuccess(result.successTitle, result.successDesc || undefined);
        router.push("/dashboard/package-orders");
      } else {
        showError(result.errorTitle || "Error", result.errorDesc || undefined);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Order Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Order Code
              </p>
              <h2 className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                {order.code}
              </h2>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="font-medium text-sm text-gray-800 dark:text-white">
                  {new Date(order.orderDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-medium text-sm text-gray-800 dark:text-white">
                  {order.quantity} pax
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 col-span-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Price</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  Rp {Number(order.totalPrice).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Package className="h-5 w-5" />
            Package Details
          </h3>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0">
              <Image
                src={order.package.image}
                alt={order.package.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                {order.package.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {order.package.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {order.package.features.slice(0, 4).map((feature, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {order.package.features.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{order.package.features.length - 4} more
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold text-gray-900 dark:text-white">
                Rp {order.package.price.toLocaleString("id-ID")} / pax
              </p>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <MessageSquare className="h-5 w-5" />
            Customer Notes
          </h3>

          {order.notes ? (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No notes provided by customer.
            </p>
          )}
        </div>
      </div>

      {/* Right Column - Customer & Actions */}
      <div className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <UserIcon className="h-5 w-5" />
            Customer Info
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {order.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.customer.name}
                </p>
                <p className="text-sm text-gray-500">{order.customer.email}</p>
              </div>
            </div>

            {order.customer.passport && (
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Passport: {order.customer.passport}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Update Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Update Status
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStatusChange("PENDING")}
              disabled={isUpdating || order.status === "PENDING"}
              className="p-3 rounded-lg border-2 border-yellow-200 bg-yellow-50 text-yellow-700 font-medium text-sm hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400"
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusChange("SUCCESS")}
              disabled={isUpdating || order.status === "SUCCESS"}
              className="p-3 rounded-lg border-2 border-green-200 bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
            >
              Success
            </button>
            <button
              onClick={() => handleStatusChange("FAILED")}
              disabled={isUpdating || order.status === "FAILED"}
              className="p-3 rounded-lg border-2 border-red-200 bg-red-50 text-red-700 font-medium text-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              Failed
            </button>
            <button
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={isUpdating || order.status === "CANCELLED"}
              className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400"
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 p-6">
          <h3 className="font-semibold text-lg mb-2 text-red-700 dark:text-red-400">
            Danger Zone
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
            Deleting this order cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
}
