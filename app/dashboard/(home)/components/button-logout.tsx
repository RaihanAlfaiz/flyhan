"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "../actions";

export default function ButtonLogout() {
  return (
    <Button
      variant={"destructive"}
      className="w-full justify-start"
      onClick={async () => {
        await logout();
      }}
    >
      <LogOut className="mr-2 w-4 h-4" />
      Logout
    </Button>
  );
}
