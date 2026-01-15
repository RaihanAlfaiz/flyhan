"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FlightPackage } from "@prisma/client";
import { checkoutPackage, verifyPromoCode } from "../lib/actions";
import { Minus, Plus, Check, Loader2 } from "lucide-react";

interface CheckoutContentProps {
  pkg: FlightPackage;
  userName: string;
}

export default function CheckoutContent({
  pkg,
  userName,
}: CheckoutContentProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const basePrice = pkg.price * quantity;
  const discountAmount = Math.floor((basePrice * promoDiscount) / 100);
  const totalPrice = basePrice - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError("");

    const result = await verifyPromoCode(promoCode.trim());

    if (result.error) {
      setPromoError(result.error);
      setPromoDiscount(0);
      setPromoCodeId(null);
    } else if (result.success) {
      setPromoDiscount(result.discount);
      setPromoCodeId(result.id);
    }

    setPromoLoading(false);
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    const result = await checkoutPackage(
      pkg.id,
      quantity,
      notes.trim() || undefined,
      promoCodeId || undefined
    );

    if (result.error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: result.error,
        confirmButtonColor: "#B88DFF",
      });
      setIsLoading(false);
      return;
    }

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Order berhasil dengan kode: ${result.orderCode}`,
        confirmButtonColor: "#B88DFF",
      }).then(() => {
        router.push("/my-packages");
      });
    }
  };

  return (
    <div className="min-h-screen bg-flysha-black text-white py-10">
      <div className="container max-w-[900px] mx-auto">
        <h1 className="font-bold text-3xl mb-8 text-center">
          Checkout Package
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left - Package Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Package Card */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6 flex gap-6">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-flysha-light-purple text-sm font-medium mb-1">
                  Holiday Package
                </p>
                <h2 className="font-bold text-xl mb-2">{pkg.title}</h2>
                <p className="text-flysha-off-purple text-sm line-clamp-2">
                  {pkg.description}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <h3 className="font-semibold text-lg mb-4">Jumlah Pesanan</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-flysha-off-purple ml-2">orang</span>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <h3 className="font-semibold text-lg mb-4">Catatan (Opsional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Butuh kursi roda, alergi makanan tertentu, dll."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-flysha-light-purple/50"
              />
            </div>

            {/* Promo Code */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <h3 className="font-semibold text-lg mb-4">Kode Promo</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode promo"
                  className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-flysha-light-purple/50"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className="h-12 px-6 rounded-xl bg-flysha-light-purple text-flysha-black font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {promoLoading ? "..." : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="text-red-400 text-sm mt-2">{promoError}</p>
              )}
              {promoDiscount > 0 && !promoError && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Diskon {promoDiscount}% berhasil
                  diterapkan!
                </p>
              )}
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-flysha-bg-purple rounded-[20px] p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-6">Ringkasan Pesanan</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Pelanggan</span>
                  <span className="font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Package</span>
                  <span className="font-medium text-right max-w-[150px] truncate">
                    {pkg.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Jumlah</span>
                  <span className="font-medium">{quantity} orang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Harga/orang</span>
                  <span className="font-medium">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <hr className="border-white/10" />

                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Subtotal</span>
                  <span className="font-medium">
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Diskon ({promoDiscount}%)</span>
                    <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}

                <hr className="border-white/10" />

                <div className="flex justify-between text-xl">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-flysha-light-purple">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-flysha-light-purple text-flysha-black font-bold text-lg hover:shadow-[0_10px_20px_0_#B88DFF] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>

              <p className="text-center text-flysha-off-purple text-xs mt-4">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang
                berlaku.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
