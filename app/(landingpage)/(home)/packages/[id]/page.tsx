import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Check } from "lucide-react";

async function getPackageById(id: string) {
  try {
    const pkg = await prisma.flightPackage.findUnique({
      where: { id },
    });
    return pkg;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) {
    notFound();
  }

  const { session } = await getUser();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-flysha-black text-white">
      {/* Header */}
      <div className="container max-w-[1130px] mx-auto pt-8 pb-4">
        <Link
          href="/#Packages"
          className="inline-flex items-center gap-2 text-flysha-off-purple hover:text-white transition-colors"
        >
          ← Kembali ke Packages
        </Link>
      </div>

      {/* Content */}
      <div className="container max-w-[1130px] mx-auto pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative h-[400px] lg:h-[500px] rounded-[30px] overflow-hidden">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-flysha-light-purple font-semibold mb-2">
                Holiday Package
              </p>
              <h1 className="font-bold text-4xl lg:text-5xl leading-tight">
                {pkg.title}
              </h1>
            </div>

            <p className="text-lg text-flysha-off-purple leading-relaxed">
              {pkg.description}
            </p>

            {/* Features */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-xl">Yang Termasuk:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-flysha-bg-purple p-4 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-flysha-light-purple flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-flysha-black" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-flysha-off-purple text-sm mb-1">
                    Harga mulai dari
                  </p>
                  <p className="font-bold text-3xl text-flysha-light-purple">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-flysha-off-purple">/orang</p>
                </div>

                {isLoggedIn ? (
                  <Link
                    href={`/packages/${pkg.id}/checkout`}
                    className="inline-flex items-center justify-center gap-2 font-bold text-flysha-black bg-flysha-light-purple rounded-full px-8 py-4 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] text-lg"
                  >
                    Order Sekarang
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center gap-2 font-bold text-flysha-black bg-flysha-light-purple rounded-full px-8 py-4 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] text-lg"
                  >
                    Login untuk Order
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
