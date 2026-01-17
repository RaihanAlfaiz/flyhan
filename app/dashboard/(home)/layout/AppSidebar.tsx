"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  Plane,
  Ticket,
  Users,
  TicketPercent,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  Crown,
  Star,
  Package,
  ShoppingBag,
  Zap,
  ScanLine,
  Settings,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Grouped Navigation Items
const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        icon: <LayoutDashboard className="w-5 h-5" />,
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: <ScanLine className="w-5 h-5" />,
        name: "Scan Ticket",
        path: "/dashboard/scan-ticket",
      },
    ],
  },
  {
    title: "Flight Management",
    items: [
      {
        icon: <Plane className="w-5 h-5" />,
        name: "Airplanes",
        path: "/dashboard/airplanes",
      },
      {
        icon: <Plane className="w-5 h-5 rotate-45" />,
        name: "Flights",
        path: "/dashboard/flights",
      },
      {
        icon: <Crown className="w-5 h-5" />,
        name: "Flight Addons",
        path: "/dashboard/flight-addons",
      },
    ],
  },
  {
    title: "Bookings",
    items: [
      {
        icon: <Ticket className="w-5 h-5" />,
        name: "Tickets",
        path: "/dashboard/tickets",
      },
      {
        icon: <ScanLine className="w-5 h-5" />,
        name: "Counter Booking",
        path: "/dashboard/counter-booking",
      },
      {
        icon: <RefreshCw className="w-5 h-5" />,
        name: "Refund Requests",
        path: "/dashboard/refund-requests",
      },
    ],
  },
  {
    title: "Packages",
    items: [
      {
        icon: <Package className="w-5 h-5" />,
        name: "All Packages",
        path: "/dashboard/packages",
      },
      {
        icon: <ShoppingBag className="w-5 h-5" />,
        name: "Package Orders",
        path: "/dashboard/package-orders",
      },
    ],
  },
  {
    title: "Users & Marketing",
    items: [
      {
        icon: <Users className="w-5 h-5" />,
        name: "Users",
        path: "/dashboard/users",
      },
      {
        icon: <TicketPercent className="w-5 h-5" />,
        name: "Promo Codes",
        path: "/dashboard/promocodes",
      },
      {
        icon: <Zap className="w-5 h-5" />,
        name: "Flash Sales",
        path: "/dashboard/flash-sales",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        icon: <Star className="w-5 h-5" />,
        name: "Best Selectives",
        path: "/dashboard/best-selectives",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        icon: <Settings className="w-5 h-5" />,
        name: "Settings",
        path: "/dashboard/settings",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    groupIndex: number;
    itemIndex: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (path === "/dashboard") {
        return pathname === "/dashboard";
      }
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname]
  );

  const handleSubmenuToggle = (groupIndex: number, itemIndex: number) => {
    setOpenSubmenu((prev) => {
      if (prev?.groupIndex === groupIndex && prev?.itemIndex === itemIndex) {
        return null;
      }
      return { groupIndex, itemIndex };
    });
  };

  const renderNavItem = (
    item: NavItem,
    groupIndex: number,
    itemIndex: number
  ) => {
    const key = `${groupIndex}-${itemIndex}`;
    const isSubmenuOpen =
      openSubmenu?.groupIndex === groupIndex &&
      openSubmenu?.itemIndex === itemIndex;

    if (item.subItems) {
      return (
        <li key={item.name}>
          <button
            onClick={() => handleSubmenuToggle(groupIndex, itemIndex)}
            className={`menu-item group w-full ${
              isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
            } cursor-pointer ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={
                isSubmenuOpen
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }
            >
              {item.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{item.name}</span>
            )}
            {(isExpanded || isHovered || isMobileOpen) && (
              <ChevronDown
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                }`}
              />
            )}
          </button>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[key] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: isSubmenuOpen ? `${subMenuHeight[key]}px` : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {item.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      );
    }

    return (
      item.path && (
        <li key={item.name}>
          <Link
            href={item.path}
            className={`menu-item group ${
              isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
            } ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={
                isActive(item.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }
            >
              {item.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{item.name}</span>
            )}
          </Link>
        </li>
      )
    );
  };

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.groupIndex}-${openSubmenu.itemIndex}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <Image
                src="/assets/images/logos/logo.svg"
                alt="FlyHan Logo"
                width={120}
                height={40}
                className="dark:invert"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {/* Group Title */}
                <h2
                  className={`mb-3 text-xs font-semibold uppercase tracking-wider flex leading-[20px] text-gray-400 dark:text-gray-500 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.title
                  ) : (
                    <MoreHorizontal className="w-5 h-5" />
                  )}
                </h2>

                {/* Group Items */}
                <ul className="flex flex-col gap-1">
                  {group.items.map((item, itemIndex) =>
                    renderNavItem(item, groupIndex, itemIndex)
                  )}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
