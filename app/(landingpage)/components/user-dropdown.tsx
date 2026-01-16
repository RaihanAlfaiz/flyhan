"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Ticket, Package, LogOut, Settings } from "lucide-react";

import { logoutCustomer } from "../lib/actions";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
  user: {
    name: string;
    avatar?: string | null;
    role: string;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 hover:bg-white/10 p-1 pr-3 rounded-full transition-all border border-transparent hover:border-white/10"
      >
        <div className="w-[45px] h-[45px] rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-flysha-light-purple">
          {user.avatar ? (
            <img
              src={user.avatar}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          ) : (
            <span className="font-bold text-flysha-black text-lg">
              {user.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {/* Optional: Show name on large screens if desired, but hiding it safes space */}
        {/* <span className="text-white font-medium hidden md:block">{user.name.split(" ")[0]}</span> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <p className="font-bold text-flysha-black truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>

          <div className="p-2 flex flex-col gap-1">
            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-flysha-black transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Settings</span>
            </Link>

            <Link
              href="/my-tickets"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-flysha-black transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-flysha-light-purple/10 flex items-center justify-center text-flysha-light-purple">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">My Tickets</span>
            </Link>

            <Link
              href="/my-packages"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-flysha-black transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">My Packages</span>
            </Link>
          </div>

          <div className="p-2 border-t border-gray-100 mt-1">
            <button
              onClick={async () => {
                await logoutCustomer();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-red-100/50 flex items-center justify-center text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
