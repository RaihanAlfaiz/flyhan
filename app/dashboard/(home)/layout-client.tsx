"use client";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";
import AppHeader from "./layout/AppHeader";
import AppSidebar from "./layout/AppSidebar";
import Backdrop from "./layout/Backdrop";

interface LayoutContentProps {
  children: React.ReactNode;
  userName: string;
}

const LayoutContent: React.FC<LayoutContentProps> = ({
  children,
  userName,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <Backdrop />
      <div
        className={`transition-all duration-300 ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        }`}
      >
        <AppHeader userName={userName} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName: string;
}

export default function DashboardLayoutClient({
  children,
  userName,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <LayoutContent userName={userName}>{children}</LayoutContent>
    </SidebarProvider>
  );
}
