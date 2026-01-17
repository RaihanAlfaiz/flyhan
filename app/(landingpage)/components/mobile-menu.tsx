"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User as UserIcon,
  Ticket,
  LogOut,
  Settings,
  Package,
} from "lucide-react";
import { User } from "lucia";
import { logoutCustomer } from "../lib/actions"; // Assuming this exists from user-dropdown
import Image from "next/image";

export default function MobileMenu({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/#FlashSale", label: "Flash Sale" },
    { href: "/#Discover", label: "Discover" },
    { href: "/#Packages", label: "Packages" },
    { href: "/#Stories", label: "Stories" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="w-8 h-8" />
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[998] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-[#080318] z-[999] p-6 shadow-2xl border-l border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-10">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Image
              src="/assets/images/logos/logo.svg"
              alt="FlyHan"
              width={100}
              height={34}
              className="w-auto h-8"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-6 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-white/90 hover:text-flysha-light-purple transition-colors border-b border-white/5 pb-2"
            >
              {link.label}
            </Link>
          ))}

          {/* User Section */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-flysha-light-purple flex items-center justify-center text-flysha-black font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-flysha-off-purple capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </div>

                <Link
                  href="/my-tickets"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-white/80 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Ticket className="w-5 h-5" />
                  My Tickets
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-white/80 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5" />
                  Wishlist
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-white/80 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>

                <form action={logoutCustomer}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="w-full text-center font-bold text-flysha-black bg-flysha-light-purple rounded-full px-6 py-3 transition-all hover:shadow-[0_10px_20px_0_#B88DFF]"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
