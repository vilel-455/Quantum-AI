import { supabase } from "./supabase";

export type NotificationType =
  | "Deposit Approved"
  | "Deposit Rejected"
  | "Withdrawal Approved"
  | "Withdrawal Rejected"
  | "Investment Started"
  | "Investment Completed"
  | "Daily Profit"
  | "Referral Bonus"
  | "KYC Approved"
  | "KYC Rejected"
  | "Account Suspended"
  | "System Announcement";

export type NotificationRecord = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationListOptions = {
  userId: string;
  type?: NotificationType | "All";
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
};

export type CreateNotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

export async function createUserNotification({
  userId,
  title,
  message,
  type = "System Announcement",
}: CreateNotificationPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
      },
    ]);

    if (error) {
      console.error("Unable to create notification", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("Unexpected notification error", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to create notification",
    };
  }
}

export async function listNotifications({
  userId,
  type = "All",
  page = 1,
  limit = 8,
  unreadOnly = false,
}: NotificationListOptions): Promise<{ data: NotificationRecord[]; error?: string }> {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (type !== "All") {
      query = query.eq("type", type);
    }

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await query.range(start, end);

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as NotificationRecord[] };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unable to load notifications",
    };
  }
}

export async function markNotificationRead(notificationId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to mark notification as read",
    };
  }
}

export async function markAllNotificationsRead(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to mark notifications as read",
    };
  }
}

export async function getNotificationUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}
