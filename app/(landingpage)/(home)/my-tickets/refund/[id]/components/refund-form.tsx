"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRefundRequest } from "../../../lib/refund-actions";
import Swal from "sweetalert2";

interface RefundFormProps {
  ticketId: string;
  flightStatus: string;
}

export default function RefundForm({
  ticketId,
  flightStatus,
}: RefundFormProps) {
  const router = useRouter();
  const [requestType, setRequestType] = useState<"RESCHEDULE" | "REFUND">(
    "REFUND"
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please provide a reason for your request",
        confirmButtonColor: "#B88DFF",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await submitRefundRequest(ticketId, requestType, reason);

      if (result.error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error,
          confirmButtonColor: "#B88DFF",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Request Submitted",
          text:
            result.message ||
            "Your request has been submitted successfully. We will process it shortly.",
          confirmButtonColor: "#B88DFF",
        });
        router.refresh();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#B88DFF",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-flysha-off-purple mb-3">
          Request Type
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRequestType("REFUND")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              requestType === "REFUND"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            💰 Refund
          </button>
          <button
            type="button"
            onClick={() => setRequestType("RESCHEDULE")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              requestType === "RESCHEDULE"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            📅 Reschedule
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-flysha-off-purple mb-2">
          Reason for {requestType.toLowerCase()}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder={
            requestType === "REFUND"
              ? "Please explain why you want a refund..."
              : "Please explain your preferred new date/time..."
          }
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-flysha-light-purple focus:ring-1 focus:ring-flysha-light-purple"
          required
        />
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4">
        <h4 className="font-medium mb-2">
          {requestType === "REFUND" ? "Refund Policy" : "Reschedule Policy"}
        </h4>
        <ul className="text-sm text-flysha-off-purple space-y-1">
          {requestType === "REFUND" ? (
            <>
              <li>• Full refund for cancelled flights</li>
              <li>• Refund will be processed within 7-14 business days</li>
              <li>• Amount will be credited to original payment method</li>
            </>
          ) : (
            <>
              <li>• Reschedule to any available flight within 30 days</li>
              <li>• Subject to seat availability</li>
              <li>• Price difference may apply</li>
            </>
          )}
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-flysha-light-purple text-flysha-black font-bold rounded-full transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-flysha-black border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          `Submit ${
            requestType.charAt(0) + requestType.slice(1).toLowerCase()
          } Request`
        )}
      </button>
    </form>
  );
}
