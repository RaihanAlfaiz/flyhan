"use client";

import { checkoutTicket } from "../lib/actions";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PaymentButtonProps {
  flightId: string;
  seatIds: string[];
  price: number;
}

export default function PaymentButton({
  flightId,
  seatIds,
  price,
}: PaymentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    // Simulate Midtrans Payment Modal
    const result = await Swal.fire({
      title: "Proceed to Payment",
      text: "Simulating Midtrans payment gateway...",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Pay Now (Simulate Success)",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#5D50C6",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Simulate Processing
      Swal.fire({
        title: "Processing Payment...",
        html: "Please wait moment",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Call Server Action
      const res = await checkoutTicket(flightId, seatIds, price);

      if (res.error) {
        Swal.fire("Error", res.error, "error");
        setIsLoading(false);
      } else {
        await Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          text: "Your tickets have been booked.",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/success-checkout");
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="font-bold text-flysha-black bg-flysha-light-purple rounded-full h-12 w-full transition-all duration-300 hover:shadow-[0_10px_20px_0_#B88DFF] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Processing..." : "Checkout with Midtrans"}
    </button>
  );
}
