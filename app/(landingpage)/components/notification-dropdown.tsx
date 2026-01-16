"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Info, BellRing } from "lucide-react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  getUnreadCount,
} from "@/lib/notification-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  link?: string | null;
  type: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotificationData = async () => {
    try {
      const [list, count] = await Promise.all([
        getUserNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotificationData();
    // Poll every minute
    const interval = setInterval(fetchNotificationData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close
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
  }, [dropdownRef]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkRead = async (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) return; // Already read

    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    await markAllRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
        title="Notifications"
      >
        <Bell
          className={`w-5 h-5 text-white transition-colors ${
            isOpen
              ? "text-flysha-light-purple"
              : "group-hover:text-flysha-light-purple"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl overflow-hidden z-[100] border border-gray-100 ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-flysha-black">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-flysha-light-purple hover:text-flysha-dark-purple font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id, item.isRead)}
                    className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !item.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div
                      className={`mt-1 h-8 w-8 min-w-[32px] rounded-full flex items-center justify-center ${
                        !item.isRead
                          ? "bg-flysha-light-purple/20 text-flysha-light-purple"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {item.type === "PROMO" ? (
                        <span className="text-lg">🎉</span>
                      ) : (
                        <BellRing className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          !item.isRead
                            ? "font-semibold text-flysha-black"
                            : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()} •{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!item.isRead && (
                      <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
            <Link
              href="/notifications"
              className="text-xs font-semibold text-flysha-light-purple hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
