"use client";

import { useRouter } from "next/navigation";
import { updateRefundRequestStatus } from "../../lib/actions";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import Swal from "sweetalert2";
import type { RefundType } from "@prisma/client";

interface ActionButtonsProps {
  requestId: string;
  requestType: RefundType;
}

export default function ActionButtons({
  requestId,
  requestType,
}: ActionButtonsProps) {
  const router = useRouter();

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Approve Request?",
      html:
        requestType === "REFUND"
          ? "<p class='text-gray-600'>This will cancel the ticket and free up the seat.</p>"
          : "<p class='text-gray-600'>This will allow the customer to reschedule their flight.</p>",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1cc88a",
    });

    if (result.isConfirmed) {
      showLoading("Processing...");
      const response = await updateRefundRequestStatus(requestId, "APPROVED");
      closeLoading();

      if (response.successTitle) {
        await showSuccess(
          response.successTitle,
          response.successDesc || undefined
        );
        router.refresh();
      } else if (response.errorTitle) {
        showError(response.errorTitle, response.errorDesc || undefined);
      }
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: "Reject Request?",
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e74a3b",
    });

    if (reason !== undefined) {
      // undefined means cancelled, empty string is valid
      showLoading("Processing...");
      const response = await updateRefundRequestStatus(requestId, "REJECTED");
      closeLoading();

      if (response.successTitle) {
        await showSuccess(
          response.successTitle,
          response.successDesc || undefined
        );
        router.refresh();
      } else if (response.errorTitle) {
        showError(response.errorTitle, response.errorDesc || undefined);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleApprove}
        className="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#1cc88a] hover:bg-[#17a673] rounded transition-colors"
      >
        ✓ Approve
      </button>
      <button
        onClick={handleReject}
        className="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors"
      >
        ✕ Reject
      </button>
    </div>
  );
}
