import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  EditProfileForm,
  ChangePasswordForm,
} from "./components/edit-profile-form";
import { User } from "lucide-react";

export default async function ProfileSettingsPage() {
  const { user } = await getUser();

  if (!user) {
    redirect("/signin");
  }

  // Jika perlu data lengkap dari DB (misal avatar yang baru update tapi cache session belum), fetch fresh.
  // Tapi session di Lucia biasanya cukup update kalau kita manage cookie. Amannya fetch dari DB atau percaya session.
  // Di action updateProfile saya revalidatePath, jadi harusnya aman fetch via prisma kalau mau super fresh.

  return (
    <>
      <section
        id="Header"
        className="bg-[url('/assets/images/background/airplane.png')] bg-no-repeat bg-cover bg-left-top h-[290px] relative"
      >
        <div className="Header-content bg-gradient-to-r from-[#080318] to-[rgba(8,3,24,0)] h-[290px]">
          <nav
            id="Navbar"
            className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px]"
          >
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/assets/images/logos/logo.svg"
                alt="logo"
                width={120}
                height={40}
              />
            </Link>
            <div className="flex gap-4">
              <Link
                href="/my-tickets"
                className="font-medium text-white hover:text-flysha-light-purple transition-colors"
              >
                My Tickets
              </Link>
            </div>

            {/* Profile Menu */}
            <div className="flex gap-[30px] items-center w-fit">
              <Link href="/profile/settings">
                <div className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-12 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
              </Link>
            </div>
          </nav>
          <div className="title container max-w-[1130px] mx-auto flex flex-col gap-1 pt-[50px] pb-[68px]">
            <h1 className="font-bold text-[32px] leading-[48px] text-white">
              My Profile
            </h1>
            <p className="font-medium text-lg leading-[27px] text-white">
              Manage your account settings
            </p>
          </div>
          <div className="w-full h-[15px] bg-gradient-to-t from-[#080318] to-[rgba(8,3,24,0)] absolute bottom-0"></div>
        </div>
      </section>

      <section className="container max-w-[1130px] mx-auto -mt-[33px] z-10 relative pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Navigation (Optional future expansion) */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b pb-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-flysha-light-purple/20 flex items-center justify-center text-flysha-dark-purple font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-flysha-black truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <Link
                href="/profile/settings"
                className="font-semibold text-flysha-dark-purple"
              >
                Settings
              </Link>
              <Link
                href="/my-tickets"
                className="font-medium text-gray-500 hover:text-flysha-dark-purple"
              >
                My Tickets
              </Link>
              <form action="/api/auth/signout" method="post">
                {/* Logout handling if needed, usually just link to signout */}
                <button className="text-red-500 font-medium hover:text-red-600 text-left w-full">
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {/* Profile Edit */}
            <EditProfileForm user={user} />

            {/* Password Change */}
            <ChangePasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
