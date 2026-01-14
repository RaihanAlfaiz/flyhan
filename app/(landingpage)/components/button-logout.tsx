"use client";

import { logoutCustomer } from "../lib/actions";
import { LogOut } from "lucide-react";

export default function ButtonLogout() {
  return (
    <button
      onClick={() => logoutCustomer()}
      className="font-semibold text-white bg-transparent border border-white/30 rounded-full px-[20px] py-[12px] transition-all duration-300 hover:bg-white/10 hover:border-white flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
