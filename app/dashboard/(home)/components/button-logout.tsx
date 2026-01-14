"use client";

import { LogOut } from "lucide-react";
import { logout } from "../actions";
import Swal from "sweetalert2";

export default function ButtonLogout() {
  return (
    <button
      className="flex w-full items-center gap-2 rounded px-3 py-2.5 text-sm font-medium text-blue-100 transition-all hover:bg-white/10 hover:text-white"
      onClick={async () => {
        const result = await Swal.fire({
          title: "Logout?",
          text: "Anda akan keluar dari aplikasi.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#4e73df",
          cancelButtonColor: "#858796",
          confirmButtonText: "Ya, Logout",
          cancelButtonText: "Batal",
          width: 400,
          padding: "1.5rem",
          customClass: {
            popup: "rounded-lg",
            confirmButton: "rounded px-6 py-2.5 font-medium",
            cancelButton: "rounded px-6 py-2.5 font-medium",
          },
        });

        if (result.isConfirmed) {
          Swal.fire({
            title: "Logging out...",
            html: "Mohon tunggu sebentar",
            allowOutsideClick: false,
            showConfirmButton: false,
            width: 300,
            padding: "2rem",
            customClass: {
              popup: "rounded-lg",
            },
            didOpen: () => {
              Swal.showLoading();
            },
          });
          await logout();
        }
      }}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
