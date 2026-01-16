import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";
import ButtonLogout from "./button-logout";
import { Heart, Ticket } from "lucide-react";

export default async function Navbar() {
  const { session, user } = await getUser();
  const isLoggedIn = !!session;

  return (
    <nav className="container max-w-[1130px] mx-auto flex justify-between items-center pt-[30px] z-50 relative">
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src="/assets/images/logos/logo.svg"
          alt="Flyhan Logo"
          width={120}
          height={40}
          priority
        />
      </Link>
      <div className="flex gap-[30px] items-center w-fit">
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
              href="#"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              Discover
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="font-medium text-white hover:text-flysha-light-purple transition-colors"
            >
              About
            </Link>
          </li>
        </ul>

        {isLoggedIn ? (
          <div className="flex items-center gap-3 pl-4 border-l border-white/20 ml-4">
            <Link href="/wishlist" className="relative group" title="Wishlist">
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Heart className="w-5 h-5 text-white group-hover:text-pink-500 transition-colors" />
              </div>
            </Link>
            <Link
              href="/my-tickets"
              className="relative group"
              title="My Tickets"
            >
              <div className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Ticket className="w-5 h-5 text-white group-hover:text-flysha-light-purple transition-colors" />
              </div>
            </Link>

            <span className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-10 w-10 transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center text-sm ml-2">
              {user?.name?.slice(0, 2).toUpperCase() || "U"}
            </span>
            <ButtonLogout />
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
    </nav>
  );
}
