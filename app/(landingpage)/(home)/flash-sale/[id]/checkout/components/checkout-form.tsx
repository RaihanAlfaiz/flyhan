"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FlightSeat } from "@prisma/client";
import { User, Loader2, Zap, X, Check, ChevronDown } from "lucide-react";
import { bookFlashSale } from "../lib/actions";

interface FlashSaleCheckoutFormProps {
  flashSaleId: string;
  flightId: string;
  availableSeats: FlightSeat[];
  discountedPrice: number;
  userName: string;
}

function SeatClassLabel({ type }: { type: string }) {
  return (
    <div className="w-full flex justify-center py-2 mb-2 mt-4">
      <span className="bg-[#3D3952] text-white px-4 py-1 rounded-full text-sm font-semibold capitalize">
        {type.toLowerCase()} Class
      </span>
    </div>
  );
}

// Confirmation Modal
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  seatNumber,
  price,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  seatNumber: string;
  price: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-flysha-bg-purple rounded-[20px] p-8 max-w-md w-full border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>

        <h3 className="font-bold text-2xl text-center mb-4">
          Konfirmasi Pemesanan
        </h3>

        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-flysha-off-purple">Kursi</span>
            <span className="font-semibold text-flysha-light-purple">
              {seatNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-flysha-off-purple">Total Bayar</span>
            <span className="font-bold text-lg">{price}</span>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-300 text-center">
            ⚠️ <strong>Demo Mode:</strong> Pembayaran ini merupakan simulasi.
            Tidak ada transaksi nyata yang akan diproses.
          </p>
        </div>

        <p className="text-center text-flysha-off-purple text-sm mb-6">
          Dengan melanjutkan, Anda menyetujui{" "}
          <span className="text-white">Syarat & Ketentuan</span> dan{" "}
          <span className="text-white">Kebijakan Privasi</span> yang berlaku.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-full bg-flysha-light-purple text-flysha-black font-bold hover:shadow-[0_10px_20px_0_#B88DFF] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Konfirmasi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlashSaleCheckoutForm({
  flashSaleId,
  flightId,
  availableSeats,
  discountedPrice,
  userName,
}: FlashSaleCheckoutFormProps) {
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<FlightSeat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  // Count stats
  const totalSeats = availableSeats.length;
  const availableCount = availableSeats.filter((s) => !s.isBooked).length;
  const bookedCount = totalSeats - availableCount;

  // Group seats by row
  const groupedSeats = availableSeats.reduce((acc, seat) => {
    const rowMatch = seat.seatNumber.match(/^(\d+)/);
    if (rowMatch) {
      const rowNum = rowMatch[1];
      if (!acc[rowNum]) {
        acc[rowNum] = [];
      }
      acc[rowNum].push(seat);
    }
    return acc;
  }, {} as Record<string, FlightSeat[]>);

  const rows = Object.keys(groupedSeats).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  const rowsWithMeta = rows.map((rowNum) => {
    const rowSeats = groupedSeats[rowNum];
    const type = rowSeats[0]?.type || "ECONOMY";
    return { rowNum, type, seats: rowSeats };
  });

  const handleSeatSelect = (seat: FlightSeat) => {
    if (seat.isBooked) return; // Can't select booked seats
    setSelectedSeat(seat);
    setError(null);
  };

  const handleProceed = () => {
    if (!selectedSeat) {
      setError("Silakan pilih kursi terlebih dahulu");
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedSeat) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await bookFlashSale(
        flashSaleId,
        flightId,
        selectedSeat.id
      );

      if (result.success) {
        router.push(`/success-checkout?ticketId=${result.ticketId}`);
      } else {
        setShowModal(false);
        setError(result.error || "Gagal melakukan booking");
      }
    } catch (err) {
      setShowModal(false);
      setError("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSeat = (seat: FlightSeat) => {
    const isSelected = selectedSeat?.id === seat.id;
    const isBooked = seat.isBooked === true;

    let buttonClass =
      "relative flex shrink-0 w-[60px] h-[60px] items-center justify-center rounded-[15px] transition-all ";
    let contentClass = "font-bold text-[20px] ";

    if (isBooked) {
      // Taken seat - gray/disabled
      buttonClass += "bg-[#3D3952] cursor-not-allowed";
      contentClass += "text-[#797684]";
    } else if (isSelected) {
      // Selected seat - purple
      buttonClass += "bg-flysha-light-purple ring-2 ring-flysha-light-purple";
      contentClass += "text-flysha-black";
    } else {
      // Available seat - white ring
      buttonClass +=
        "ring-2 ring-white hover:ring-flysha-light-purple/50 cursor-pointer";
      contentClass += "text-white";
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked}
        onClick={() => handleSeatSelect(seat)}
        className={buttonClass}
        title={
          isBooked
            ? "Kursi ini sudah dipesan"
            : `Pilih kursi ${seat.seatNumber}`
        }
      >
        <span className={contentClass}>{seat.seatNumber}</span>
      </button>
    );
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        seatNumber={selectedSeat?.seatNumber || ""}
        price={formatCurrency(discountedPrice)}
      />

      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Passenger Info */}
        <div className="bg-flysha-bg-purple rounded-[20px] p-6">
          <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Info Penumpang
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-flysha-off-purple mb-2">
                Nama Penumpang
              </label>
              <input
                type="text"
                value={userName}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Seat Selection with Airplane */}
        <div className="bg-flysha-bg-purple rounded-[20px] p-6">
          <h2 className="font-semibold text-xl mb-2 text-center">
            Pilih Kursi
          </h2>

          {/* Seat Stats */}
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div className="text-center">
              <span className="text-flysha-light-purple font-bold text-lg">
                {availableCount}
              </span>
              <p className="text-flysha-off-purple">Tersedia</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400 font-bold text-lg">
                {bookedCount}
              </span>
              <p className="text-flysha-off-purple">Terisi</p>
            </div>
            <div className="text-center">
              <span className="text-white font-bold text-lg">{totalSeats}</span>
              <p className="text-flysha-off-purple">Total</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-[409px]">
              {/* Plane Body & Wings Background */}
              <div className="absolute -left-[259px] bottom-0 w-[927px] -z-10 flex justify-center">
                <Image
                  src="/assets/images/background/plane-wings.svg"
                  alt="wings"
                  width={927}
                  height={200}
                  className="w-[927px]"
                />
              </div>
              <div className="relative -z-0">
                <Image
                  src="/assets/images/background/plane-body.svg"
                  alt="plane body"
                  width={409}
                  height={782}
                  className="w-full"
                />
              </div>

              <div className="absolute top-[18px] left-1/2 -translate-x-1/2">
                <Image
                  src="/assets/images/background/plane-windshield.svg"
                  alt="windshield"
                  width={200}
                  height={100}
                />
              </div>

              {/* Seats Content */}
              <div className="absolute top-[120px] left-0 right-0 px-[30px] h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-20">
                {/* Legend */}
                <div className="flex gap-4 mb-5 justify-center sticky top-0 bg-flysha-bg-purple/90 backdrop-blur-sm p-2 rounded-full z-10 w-fit mx-auto border border-white/10">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-flysha-light-purple" />
                    <span className="font-semibold text-xs">Selected</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-[#3D3952]" />
                    <span className="font-semibold text-xs">Taken</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[14px] h-[14px] flex shrink-0 rounded-full bg-flysha-black border border-white" />
                    <span className="font-semibold text-xs">Available</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="flex flex-col gap-5">
                  {rowsWithMeta.map((row, index) => {
                    const isNewType =
                      index === 0 || rowsWithMeta[index - 1].type !== row.type;

                    return (
                      <div key={row.rowNum} className="flex flex-col w-full">
                        {isNewType && <SeatClassLabel type={row.type} />}

                        <div className="seat-row flex justify-between">
                          {/* Left Column */}
                          <div className="seat-col flex gap-[19px]">
                            {["A", "B"].map((colChar) => {
                              const seat = row.seats.find((s) =>
                                s.seatNumber.endsWith(colChar)
                              );
                              if (seat) return renderSeat(seat);
                              return (
                                <div
                                  key={`placeholder-${row.rowNum}-${colChar}`}
                                  className="w-[60px] h-[60px]"
                                />
                              );
                            })}
                          </div>

                          {/* Right Column */}
                          <div className="seat-col flex gap-[19px]">
                            {["C", "D"].map((colChar) => {
                              const seat = row.seats.find((s) =>
                                s.seatNumber.endsWith(colChar)
                              );
                              if (seat) return renderSeat(seat);
                              return (
                                <div
                                  key={`placeholder-${row.rowNum}-${colChar}`}
                                  className="w-[60px] h-[60px]"
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                <span className="text-xs text-flysha-off-purple mb-1">
                  Scroll
                </span>
                <ChevronDown className="w-5 h-5 text-flysha-light-purple" />
              </div>
            </div>
          </div>

          {/* Selected Seat Info */}
          {selectedSeat && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg text-center">
              <p className="text-sm text-flysha-off-purple">Kursi dipilih:</p>
              <p className="font-bold text-2xl text-flysha-light-purple">
                {selectedSeat.seatNumber}
              </p>
            </div>
          )}
        </div>

        {/* Proceed Button */}
        <button
          type="button"
          onClick={handleProceed}
          disabled={!selectedSeat}
          className="w-full py-4 rounded-full bg-flysha-light-purple text-flysha-black font-bold hover:shadow-[0_10px_20px_0_#B88DFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Lanjutkan - {formatCurrency(discountedPrice)}
        </button>
      </div>
    </>
  );
}
