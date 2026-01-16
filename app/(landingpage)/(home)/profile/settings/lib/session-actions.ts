"use server";

import { getUser, lucia } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserSessions() {
  const { user } = await getUser();
  if (!user) return [];

  try {
    const sessions = await lucia.getUserSessions(user.id);
    // Sort by lastActive (descending) or expiresAt
    // Note: Lucia sessions might not be sorted.
    // Since we added 'lastActive' to schema, it should be available in attributes if reading from fresh DB,
    // BUT getUserSessions uses adapter.
    return sessions.map((session) => ({
      ...session,
      isCurrent: false, // We will set this in UI by comparing vs current session ID if possible, or handle in action?
      // We can get current session ID from getUser()
    }));
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return [];
  }
}

export async function getCurrentSessionId() {
  const { session } = await getUser();
  return session?.id || null;
}

export async function revokeSession(sessionId: string) {
  const { user } = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await lucia.invalidateSession(sessionId);
    revalidatePath("/profile/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to revoke session" };
  }
}

export async function revokeAllSessions() {
  const { user, session } = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Invalidate all user sessions
    const sessions = await lucia.getUserSessions(user.id);
    for (const s of sessions) {
      if (s.id !== session?.id) {
        // Don't kill current session unless intended
        await lucia.invalidateSession(s.id);
      }
    }
    revalidatePath("/profile/settings");
    return { success: true };
  } catch (e) {
    return { error: "Failed" };
  }
}
