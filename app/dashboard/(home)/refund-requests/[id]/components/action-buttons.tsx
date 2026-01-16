"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  approveRefundRequest,
  approveRescheduleRequest,
  rejectRequest,
  getAvailableFlightsForReschedule,
} from "../../lib/actions";
import { calculateRefund, formatCurrency } from "../../lib/refund-calculator";
import {
  showSuccess,
  showError,
  showLoading,
  closeLoading,
} from "@/lib/sweetalert";
import Swal from "sweetalert2";
import type { RefundType } from "@prisma/client";
import {
  Calculator,
  Calendar,
  RefreshCw,
  XCircle,
  CheckCircle,
} from "lucide-react";

interface ActionButtonsProps {
  requestId: string;
  requestType: RefundType;
  ticketPrice: number;
  departureDate: Date;
  currentFlightId: string;
}

export default function ActionButtons({
  requestId,
  requestType,
  ticketPrice,
  departureDate,
  currentFlightId,
}: ActionButtonsProps) {
  const router = useRouter();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [availableFlights, setAvailableFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>("");
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const refundCalc = calculateRefund(ticketPrice, departureDate);

  useEffect(() => {
    if (showRescheduleModal) {
      loadAvailableFlights();
    }
  }, [showRescheduleModal]);

  const loadAvailableFlights = async () => {
    const flights = await getAvailableFlightsForReschedule(currentFlightId);
    setAvailableFlights(flights);
  };

  const handleApproveRefund = async () => {
    setLoading(true);
    const response = await approveRefundRequest(
      requestId,
      refundCalc.refundAmount,
      adminNotes
    );
    setLoading(false);

    if (response.successTitle) {
      await showSuccess(
        response.successTitle,
        response.successDesc || undefined
      );
      setShowRefundModal(false);
      router.refresh();
    } else if (response.errorTitle) {
      showError(response.errorTitle, response.errorDesc || undefined);
    }
  };

  const handleApproveReschedule = async () => {
    if (!selectedFlight || !selectedSeat) {
      showError("Missing Selection", "Please select a flight and seat");
      return;
    }

    setLoading(true);
    const response = await approveRescheduleRequest(
      requestId,
      selectedFlight,
      selectedSeat,
      adminNotes
    );
    setLoading(false);

    if (response.successTitle) {
      await showSuccess(
        response.successTitle,
        response.successDesc || undefined
      );
      setShowRescheduleModal(false);
      router.refresh();
    } else if (response.errorTitle) {
      showError(response.errorTitle, response.errorDesc || undefined);
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: "Tolak Permohonan?",
      input: "textarea",
      inputLabel: "Alasan penolakan (wajib)",
      inputPlaceholder: "Masukkan alasan...",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e74a3b",
      inputValidator: (value) => {
        if (!value) {
          return "Alasan penolakan harus diisi!";
        }
      },
    });

    if (reason) {
      showLoading("Memproses...");
      const response = await rejectRequest(requestId, reason);
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

  const selectedFlightData = availableFlights.find(
    (f) => f.id === selectedFlight
  );

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            requestType === "REFUND"
              ? setShowRefundModal(true)
              : setShowRescheduleModal(true)
          }
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#1cc88a] hover:bg-[#17a673] rounded transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-[#e74a3b] hover:bg-[#c23a2d] rounded transition-colors flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Approve Refund
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kalkulasi refund berdasarkan kebijakan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Refund Calculation */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga Tiket Asli</span>
                  <span className="font-medium">
                    {formatCurrency(refundCalc.originalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Persentase Refund</span>
                  <span
                    className={`font-bold ${
                      refundCalc.refundPercent >= 75
                        ? "text-green-600"
                        : refundCalc.refundPercent >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {refundCalc.refundPercent}%
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      Jumlah Refund
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(refundCalc.refundAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Policy Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Kebijakan:</strong> {refundCalc.policyDescription}
                </p>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Admin (opsional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Tambahkan catatan untuk customer..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApproveRefund}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Approve Reschedule
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pilih penerbangan dan kursi baru
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Flight Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Penerbangan Baru
                </label>
                {availableFlights.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 text-sm">
                      Tidak ada penerbangan tersedia dengan rute yang sama.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {availableFlights.map((flight) => (
                      <label
                        key={flight.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFlight === flight.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="flight"
                          value={flight.id}
                          checked={selectedFlight === flight.id}
                          onChange={(e) => {
                            setSelectedFlight(e.target.value);
                            setSelectedSeat("");
                          }}
                          className="text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {flight.plane.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(flight.departureDate).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {flight.seats.length} kursi tersedia
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Seat Selection */}
              {selectedFlightData && selectedFlightData.seats.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Kursi Baru
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlightData.seats.map((seat: any) => (
                      <button
                        key={seat.id}
                        onClick={() => setSelectedSeat(seat.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSeat === seat.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {seat.seatNumber}
                        <span className="ml-1 text-xs opacity-75">
                          ({seat.type})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Admin (opsional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Tambahkan catatan untuk customer..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApproveReschedule}
                disabled={loading || !selectedFlight || !selectedSeat}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
