import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Clock, Plane, Users, Calendar, Zap, ArrowRight } from "lucide-react";
import FlashSaleBooking from "./components/flash-sale-booking";

async function getFlashSaleWithFlight(id: string) {
  try {
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        flight: {
          include: {
            plane: true,
            seats: {
              where: { isBooked: false },
            },
          },
        },
      },
    });
    return flashSale;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FlashSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, user } = await getUser();

  const flashSale = await getFlashSaleWithFlight(id);

  if (!flashSale) {
    notFound();
  }

  // Check if flash sale is still valid
  const now = new Date();
  const isExpired = new Date(flashSale.endDate) < now;
  const isNotStarted = new Date(flashSale.startDate) > now;
  const isSoldOut = flashSale.soldCount >= flashSale.maxQuota;
  const isInactive = !flashSale.isActive;

  const originalPrice = flashSale.flight.price;
  const discountedPrice = Math.floor(
    originalPrice * (1 - flashSale.discountPercent / 100)
  );
  const savings = originalPrice - discountedPrice;
  const availableSeats = flashSale.flight.seats.length;
  const remainingQuota = flashSale.maxQuota - flashSale.soldCount;

  return (
    <div className="min-h-screen bg-flysha-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-flysha-bg-purple to-flysha-black">
        <div className="container max-w-[1130px] mx-auto pt-8 pb-16">
          <Link
            href="/#FlashSale"
            className="inline-flex items-center gap-2 text-flysha-off-purple hover:text-white transition-colors mb-8"
          >
            ← Kembali ke Flash Sale
          </Link>

          {/* Flash Sale Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-4 py-2 rounded-full">
              <Zap className="w-5 h-5" />
              FLASH SALE {flashSale.discountPercent}% OFF
            </div>
            {isExpired && (
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                Expired
              </span>
            )}
            {isNotStarted && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Coming Soon
              </span>
            )}
            {isSoldOut && (
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                Sold Out
              </span>
            )}
          </div>

          <h1 className="font-bold text-4xl lg:text-5xl mb-4">
            {flashSale.title}
          </h1>

          {flashSale.description && (
            <p className="text-flysha-off-purple text-lg max-w-2xl">
              {flashSale.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1130px] mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Card */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Detail Penerbangan
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Plane Image */}
                <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={flashSale.flight.plane.image}
                    alt={flashSale.flight.plane.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Flight Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono bg-white/10 px-3 py-1 rounded-lg text-sm">
                      {flashSale.flight.plane.code}
                    </span>
                    <span className="text-flysha-off-purple">
                      {flashSale.flight.plane.name}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-bold text-2xl">
                        {flashSale.flight.departureCityCode}
                      </p>
                      <p className="text-sm text-flysha-off-purple">
                        {flashSale.flight.departureCity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(flashSale.flight.departureDate)}
                      </p>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-flysha-light-purple to-transparent" />
                      <Plane className="w-5 h-5 text-flysha-light-purple rotate-90" />
                      <div className="h-px flex-1 bg-gradient-to-l from-flysha-light-purple to-transparent" />
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-2xl">
                        {flashSale.flight.destinationCityCode}
                      </p>
                      <p className="text-sm text-flysha-off-purple">
                        {flashSale.flight.destinationCity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(flashSale.flight.arrivalDate)}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-flysha-off-purple">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(flashSale.flight.departureDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Sale Info */}
            <div className="bg-flysha-bg-purple rounded-[20px] p-6">
              <h2 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Info Flash Sale
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-flysha-off-purple text-sm mb-1">Periode</p>
                  <p className="font-semibold text-sm">
                    {new Date(flashSale.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    -{" "}
                    {new Date(flashSale.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-flysha-off-purple text-sm mb-1">
                    Sisa Kuota
                  </p>
                  <p className="font-bold text-xl text-flysha-light-purple">
                    {remainingQuota}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-flysha-off-purple text-sm mb-1">
                    Kursi Tersedia
                  </p>
                  <p className="font-bold text-xl">{availableSeats}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-flysha-off-purple text-sm mb-1">Hemat</p>
                  <p className="font-bold text-xl text-green-400">
                    {formatCurrency(savings)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-flysha-bg-purple rounded-[20px] p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan Harga</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">Harga Normal</span>
                  <span className="line-through text-gray-500">
                    {formatCurrency(originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">
                    Diskon {flashSale.discountPercent}%
                  </span>
                  <span className="text-green-400">
                    - {formatCurrency(savings)}
                  </span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-xl">
                  <span className="font-bold">Harga Flash Sale</span>
                  <span className="font-bold text-flysha-light-purple">
                    {formatCurrency(discountedPrice)}
                  </span>
                </div>
                <p className="text-xs text-flysha-off-purple">/orang</p>
              </div>

              {/* CTA Button */}
              {isExpired || isNotStarted || isSoldOut || isInactive ? (
                <div className="text-center">
                  <button
                    disabled
                    className="w-full py-4 rounded-full bg-gray-600 text-gray-400 font-bold cursor-not-allowed"
                  >
                    {isExpired
                      ? "Flash Sale Berakhir"
                      : isNotStarted
                      ? "Belum Dimulai"
                      : isSoldOut
                      ? "Kuota Habis"
                      : "Tidak Tersedia"}
                  </button>
                </div>
              ) : session ? (
                <Link
                  href={`/flash-sale/${flashSale.id}/checkout`}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-flysha-light-purple text-flysha-black font-bold hover:shadow-[0_10px_20px_0_#B88DFF] transition-all"
                >
                  Lanjut ke Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-flysha-light-purple text-flysha-black font-bold hover:shadow-[0_10px_20px_0_#B88DFF] transition-all"
                >
                  Login untuk Booking
                </Link>
              )}

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
