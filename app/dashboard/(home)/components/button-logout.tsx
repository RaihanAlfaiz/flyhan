"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "../actions";
import Swal from "sweetalert2";

export default function ButtonLogout() {
  return (
    <Button
      variant={"destructive"}
      className="w-full justify-start hover:bg-red-600 transition-colors"
      onClick={async () => {
        const result = await Swal.fire({
          title: "Logout?",
          text: "Anda akan keluar dari aplikasi.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#EF4444",
          cancelButtonColor: "#6B7280",
          confirmButtonText: "Ya, Logout",
          cancelButtonText: "Batal",
          width: 400,
          padding: "1.5rem",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "rounded-lg px-6 py-2.5 font-medium",
            cancelButton: "rounded-lg px-6 py-2.5 font-medium",
          },
        });

        if (result.isConfirmed) {
          // Show loading state
          Swal.fire({
            title: "Logging out...",
            html: "Mohon tunggu sebentar",
            allowOutsideClick: false,
            showConfirmButton: false,
            width: 300,
            padding: "2rem",
            customClass: {
              popup: "rounded-2xl",
            },
            didOpen: () => {
              Swal.showLoading();
            },
          });
          await logout();
        }
      }}
    >
      <LogOut className="mr-2 w-4 h-4" />
      Logout
    </Button>
  );
}
