"use client";

import { useEffect, useState } from "react";
import {
  getCurrentSessionId,
  getUserSessions,
  revokeAllSessions,
  revokeSession,
} from "../lib/session-actions";
import { Monitor, Smartphone, Trash2, Shield, LogOut } from "lucide-react";
import Swal from "sweetalert2";

interface SessionData {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  lastActive?: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sess, curr] = await Promise.all([
        getUserSessions(),
        getCurrentSessionId(),
      ]);

      const mapped = sess.map((s: any) => ({
        ...s,
        isCurrent: s.id === curr,
      }));
      setSessions(mapped);
      setCurrentSessionId(curr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(sessionId: string) {
    const result = await Swal.fire({
      title: "Revoke Session?",
      text: "You will be logged out on that device.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, revoke it",
    });

    if (result.isConfirmed) {
      const res = await revokeSession(sessionId);
      if (res.success) {
        Swal.fire({
          title: "Revoked!",
          text: "Session has been revoked.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        loadData();
      } else {
        Swal.fire("Error", "Failed to revoke session", "error");
      }
    }
  }

  async function handleRevokeAll() {
    const result = await Swal.fire({
      title: "Revoke All Other Sessions?",
      text: "You will be logged out from all other devices except this one.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, revoke all",
    });

    if (result.isConfirmed) {
      const res = await revokeAllSessions();
      if (res.success) {
        Swal.fire({
          title: "Success!",
          text: "All other sessions revoked.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        loadData();
      } else {
        Swal.fire("Error", "Failed to revoke sessions", "error");
      }
    }
  }

  // Parse User Agent simpler
  const getDeviceIcon = (ua: string | null | undefined) => {
    if (!ua) return <Monitor className="w-5 h-5" />;
    if (
      ua.toLowerCase().includes("mobile") ||
      ua.toLowerCase().includes("android") ||
      ua.toLowerCase().includes("iphone")
    ) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const cleanUA = (ua: string | null | undefined) => {
    if (!ua) return "Unknown Device";
    // Simple parser
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac")) return "Mac";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("Android")) return "Android";
    return "Unknown Device"; // Or show full UA truncated
  };

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-flysha-black">
              Active Sessions
            </h2>
            <p className="text-sm text-gray-400">Manage your active devices</p>
          </div>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="text-red-500 hover:text-red-600 text-sm font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out all others
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-gray-400">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            No active sessions found (Wait, how are you here?)
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-400">
                  {getDeviceIcon(session.userAgent)}
                </div>
                <div>
                  <p className="font-semibold text-flysha-black flex items-center gap-2">
                    {cleanUA(session.userAgent)}
                    {session.isCurrent && (
                      <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        CURRENT
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.ipAddress || "Unknown IP"} • Last active:{" "}
                    {new Date(
                      session.lastActive || session.expiresAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors tooltip"
                  title="Revoke Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
