"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FlashSale, Flight, Airplane } from "@prisma/client";
import { Clock, Zap } from "lucide-react";

type FlashSaleWithFlight = FlashSale & {
  flight: Flight & { plane: Airplane };
};

interface FlashSaleSectionProps {
  flashSales: FlashSaleWithFlight[];
}

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1.5 text-white text-xs font-mono">
      <Clock className="w-3.5 h-3.5" />
      <span className="bg-white/20 px-1.5 py-0.5 rounded">
        {String(timeLeft.hours).padStart(2, "0")}
      </span>
      :
      <span className="bg-white/20 px-1.5 py-0.5 rounded">
        {String(timeLeft.minutes).padStart(2, "0")}
      </span>
      :
      <span className="bg-white/20 px-1.5 py-0.5 rounded">
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function FlashSaleCard({ sale }: { sale: FlashSaleWithFlight }) {
  const originalPrice = sale.flight.price;
  const discountedPrice = Math.floor(
    originalPrice * (1 - sale.discountPercent / 100)
  );
  const remaining = sale.maxQuota - sale.soldCount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const isLive =
    new Date() >= new Date(sale.startDate) &&
    new Date() <= new Date(sale.endDate);

  return (
    <div className="flex flex-col gap-4 min-w-[320px] bg-white rounded-[20px] overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      <div className="relative w-full h-[180px]">
        <Image
          src={
            sale.image ||
            sale.flight.plane.image ||
            "/assets/images/thumbnail/thumbnail1.png"
          }
          alt={sale.title}
          fill
          className="object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Discount Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1.5 rounded-full text-sm flex items-center gap-1 shadow-lg">
          <Zap className="w-3.5 h-3.5" />
          {sale.discountPercent}% OFF
        </div>

        {/* Countdown */}
        {isLive && (
          <div className="absolute bottom-4 left-4">
            <CountdownTimer endDate={sale.endDate} />
          </div>
        )}

        {/* Quota Badge */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {remaining} left
        </div>
      </div>

      <div className="p-4 pt-0 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-lg text-flysha-black line-clamp-1">
            {sale.title}
          </h3>
          <p className="text-sm text-gray-500">
            {sale.flight.departureCity} → {sale.flight.destinationCity}
          </p>
        </div>

        {sale.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {sale.description}
          </p>
        )}

        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <p className="text-xs text-gray-400 line-through">
              {formatCurrency(originalPrice)}
            </p>
            <p className="font-bold text-xl text-flysha-light-purple">
              {formatCurrency(discountedPrice)}
            </p>
          </div>

          <Link
            href={`/flash-sale/${sale.id}`}
            className="bg-flysha-light-purple text-flysha-black font-semibold text-sm px-5 py-2.5 rounded-full hover:shadow-lg transition-all"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FlashSaleSection({
  flashSales,
}: FlashSaleSectionProps) {
  if (!flashSales || flashSales.length === 0) {
    return null; // Don't show section if no flash sales
  }

  return (
    <section
      id="FlashSale"
      className="container max-w-[1130px] mx-auto pt-[100px]"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              <h2 className="font-bold text-[32px] md:text-[40px] leading-tight">
                Flash Sale{" "}
                <span className="text-flysha-light-purple">Special</span>
              </h2>
            </div>
            <p className="text-base text-gray-400">
              Limited time offers for your dream destinations. Hurry before
              they're gone!
            </p>
          </div>
          <Link
            href="/flights"
            className="hidden md:block px-6 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white hover:text-flysha-black transition-all"
          >
            View All Deals
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 pt-4 px-4 -mx-4 hide-scrollbar snap-x">
          {flashSales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      </div>
    </section>
  );
}
