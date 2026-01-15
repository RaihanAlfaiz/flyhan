import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plane, Zap } from "lucide-react";
import FlashSaleCheckoutForm from "./components/checkout-form";

async function getFlashSaleWithFlight(id: string) {
  try {
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        flight: {
          include: {
            plane: true,
            seats: {
              orderBy: { seatNumber: "asc" },
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
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function FlashSaleCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, user } = await getUser();

  if (!session) {
    redirect("/signin");
  }

  const flashSale = await getFlashSaleWithFlight(id);

  if (!flashSale) {
    notFound();
  }

  // Validate flash sale
  const now = new Date();
  if (
    !flashSale.isActive ||
    new Date(flashSale.endDate) < now ||
    new Date(flashSale.startDate) > now ||
    flashSale.soldCount >= flashSale.maxQuota
  ) {
    redirect(`/flash-sale/${id}`);
  }

  const originalPrice = flashSale.flight.price;
  const discountedPrice = Math.floor(
    originalPrice * (1 - flashSale.discountPercent / 100)
  );

  return (
    <div className="min-h-screen bg-flysha-black text-white">
      {/* Header */}
      <div className="bg-flysha-bg-purple/50 border-b border-white/10">
        <div className="container max-w-[1130px] mx-auto py-6">
          <Link
            href={`/flash-sale/${id}`}
            className="inline-flex items-center gap-2 text-flysha-off-purple hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1.5 rounded-full text-sm">
              <Zap className="w-4 h-4" />
              {flashSale.discountPercent}% OFF
            </div>
            <h1 className="font-bold text-2xl lg:text-3xl">
              Checkout - {flashSale.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1130px] mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <FlashSaleCheckoutForm
              flashSaleId={flashSale.id}
              flightId={flashSale.flight.id}
              availableSeats={flashSale.flight.seats}
              discountedPrice={discountedPrice}
              userName={user?.name || ""}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-flysha-bg-purple rounded-[20px] p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>

              {/* Flight Info */}
              <div className="flex gap-4 mb-6">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={flashSale.flight.plane.image}
                    alt={flashSale.flight.plane.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{flashSale.flight.plane.name}</p>
                  <div className="flex items-center gap-2 text-sm text-flysha-off-purple">
                    <span>{flashSale.flight.departureCityCode}</span>
                    <Plane className="w-3 h-3" />
                    <span>{flashSale.flight.destinationCityCode}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(flashSale.flight.departureDate)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-flysha-off-purple">
                  <span>Harga Normal</span>
                  <span className="line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-flysha-off-purple">
                    Diskon Flash Sale
                  </span>
                  <span className="text-green-400">
                    -{flashSale.discountPercent}%
                  </span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-flysha-light-purple">
                    {formatCurrency(discountedPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
