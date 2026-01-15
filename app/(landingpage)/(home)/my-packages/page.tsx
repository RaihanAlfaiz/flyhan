import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Package, Calendar, Hash, Users } from "lucide-react";

async function getMyPackageOrders(userId: string) {
  try {
    const orders = await prisma.packageOrder.findMany({
      where: { customerId: userId },
      include: {
        package: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export default async function MyPackagesPage() {
  const { session, user } = await getUser();

  if (!session || !user) {
    redirect("/signin");
  }

  const orders = await getMyPackageOrders(user.id);

  return (
    <div className="min-h-screen bg-flysha-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-flysha-bg-purple to-flysha-black py-16">
        <div className="container max-w-[1130px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-4xl mb-2">Pesanan Package Saya</h1>
              <p className="text-flysha-off-purple">
                Kelola semua pesanan holiday package Anda di sini
              </p>
            </div>
            <Link
              href="/#Packages"
              className="hidden md:inline-flex items-center gap-2 font-semibold text-flysha-black bg-flysha-light-purple rounded-full px-6 py-3 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
            >
              <Package className="w-4 h-4" />
              Lihat Packages
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1130px] mx-auto py-10">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-flysha-off-purple mb-4" />
            <h2 className="font-bold text-2xl mb-2">Belum Ada Pesanan</h2>
            <p className="text-flysha-off-purple mb-6">
              Anda belum memiliki pesanan package. Mulai jelajahi package
              liburan kami!
            </p>
            <Link
              href="/#Packages"
              className="inline-flex items-center gap-2 font-semibold text-flysha-black bg-flysha-light-purple rounded-full px-6 py-3 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
            >
              Jelajahi Packages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-flysha-bg-purple rounded-[20px] overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={order.package.image}
                    alt={order.package.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-flysha-bg-purple to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "SUCCESS"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {order.status === "SUCCESS"
                        ? "Berhasil"
                        : order.status === "PENDING"
                        ? "Menunggu"
                        : "Dibatalkan"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-4">
                    {order.package.title}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-flysha-off-purple">
                      <Hash className="w-4 h-4" />
                      <span>Kode: </span>
                      <span className="font-mono font-semibold text-white">
                        {order.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-flysha-off-purple">
                      <Users className="w-4 h-4" />
                      <span>Jumlah: </span>
                      <span className="text-white">{order.quantity} orang</span>
                    </div>
                    <div className="flex items-center gap-3 text-flysha-off-purple">
                      <Calendar className="w-4 h-4" />
                      <span>Tanggal Order: </span>
                      <span className="text-white">
                        {new Date(order.orderDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-flysha-off-purple text-xs">
                        Total Pembayaran
                      </p>
                      <p className="font-bold text-xl text-flysha-light-purple">
                        Rp {Number(order.totalPrice).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
