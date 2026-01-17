import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";
import { Heart } from "lucide-react";
import MobileMenu from "./mobile-menu";
import NotificationDropdown from "./notification-dropdown";
import UserDropdown from "./user-dropdown";

export default async function Navbar() {
  const { session, user } = await getUser();
  const isLoggedIn = !!session;

  return (
    <nav className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px] px-4 md:px-0 z-50 relative">
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/assets/images/logos/logo.svg"
          alt="Flyhan Logo"
          width={120}
          height={40}
          priority
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-[30px] items-center w-fit">
        <ul className="flex gap-[30px] items-center">
          <li>
            <Link
              href="/"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/#FlashSale"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Flash Sale
            </Link>
          </li>
          <li>
            <Link
              href="/#Discover"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Discover
            </Link>
          </li>
          <li>
            <Link
              href="/#Packages"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Packages
            </Link>
          </li>
          <li>
            <Link
              href="/#Stories"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Stories
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              About
            </Link>
          </li>
        </ul>

        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-white/20 ml-4">
            <NotificationDropdown />
            <Link href="/wishlist" className="relative group" title="Wishlist">
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Heart className="w-5 h-5 text-white group-hover:text-pink-500 transition-colors" />
              </div>
            </Link>

            <UserDropdown user={user} />
          </div>
        ) : (
          <div className="pl-4 border-l border-white/20 ml-4">
            <Link
              href="/signin"
              className="font-bold text-flysha-black bg-flysha-light-purple rounded-full px-[30px] py-[12px] transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF]"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu user={user} />
    </nav>
  );
}
