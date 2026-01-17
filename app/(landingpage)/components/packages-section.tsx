"use client";

import Image from "next/image";
import Link from "next/link";
import { FlightPackage } from "@prisma/client";

function PackageCard({
  id,
  image,
  title,
  features,
  price,
  rating,
}: {
  id: string;
  image: string;
  title: string;
  features: string[];
  price: string;
  rating: number;
}) {
  return (
    <Link
      href={`/packages/${id}`}
      className="group relative flex flex-col h-[400px] w-full min-w-[300px] rounded-[30px] overflow-hidden cursor-pointer"
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 p-6 w-full flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 mb-1">
              <Image
                src="/assets/images/icons/Star.svg"
                width={16}
                height={16}
                alt="star"
              />
              <span className="text-white font-semibold text-sm">{rating}</span>
            </div>
            <h3 className="font-bold text-2xl text-white line-clamp-2">
              {title}
            </h3>
          </div>
          <p className="font-bold text-flysha-light-purple text-xl whitespace-nowrap">
            {price}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {features.slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="text-xs font-medium text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

interface PackagesSectionProps {
  packages?: FlightPackage[];
}

export default function PackagesSection({
  packages = [],
}: PackagesSectionProps) {
  return (
    <section
      id="Packages"
      className="container max-w-[1130px] mx-auto pt-[100px] px-4 md:px-0"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-[32px] md:text-[40px] leading-tight text-white">
              Holiday <span className="text-flysha-light-purple">Packages</span>
            </h2>
            <p className="text-base text-gray-400">
              All-in-one bundles for stress-free travel
            </p>
          </div>
          <button className="hidden md:block px-6 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white hover:text-flysha-black transition-all">
            View All Packages
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages && packages.length > 0 ? (
            packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                image={pkg.image}
                title={pkg.title}
                features={pkg.features}
                price={`Rp ${pkg.price.toLocaleString("id-ID")}`}
                rating={4.8} // Default/Mock rating as DB doesn't have it yet
              />
            ))
          ) : (
            <p className="text-gray-400 col-span-3 text-center py-10">
              No packages available at the moment.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
