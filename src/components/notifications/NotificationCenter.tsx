import React from "react";
import { Badge, Button, Card } from "../../design-system";
import {
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord,
  type NotificationType,
} from "../../lib/notifications";

const notificationTypes: Array<NotificationType | "All"> = [
  "All",
  "Deposit Approved",
  "Deposit Rejected",
  "Withdrawal Approved",
  "Withdrawal Rejected",
  "Investment Started",
  "Investment Completed",
  "Daily Profit",
  "Referral Bonus",
  "KYC Approved",
  "KYC Rejected",
  "Account Suspended",
  "System Announcement",
];

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString();
}

export function NotificationCenter() {
  const [items, setItems] = React.useState<NotificationRecord[]>([]);
  const [filter, setFilter] = React.useState<NotificationType | "All">("All");
  const [page, setPage] = React.useState(1);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadNotifications = React.useCallback(async () => {
    const userId = (await import("../../lib/supabase")).supabase.auth.getUser().then((res) => res.data.user?.id ?? null);
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await listNotifications({ userId, type: filter, page, limit: 8 });
    if (result.error) {
      setError(result.error);
      setItems([]);
    } else {
      setItems(result.data);
      setError(null);
    }

    const count = await getNotificationUnreadCount(userId);
    setUnreadCount(count);
    setLoading(false);
  }, [filter, page]);

  React.useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    const result = await markNotificationRead(id);
    if (result.ok) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const userId = (await import("../../lib/supabase")).supabase.auth.getUser().then((res) => res.data.user?.id ?? null);
    if (!userId) return;
    const result = await markAllNotificationsRead(userId);
    if (result.ok) {
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <Card className="space-y-4 border border-[#E5E7EB] bg-white/90 p-6 dark:border-white/10 dark:bg-[#081120]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">
            Notifications
          </div>
          <h2 className="text-xl font-semibold text-[#1A365D] dark:text-white">Your inbox</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning">{unreadCount} unread</Badge>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {notificationTypes.map((type) => (
          <Button
            key={type}
            variant={filter === type ? "primary" : "ghost"}
            size="sm"
            onClick={() => {
              setPage(1);
              setFilter(type);
            }}
          >
            {type}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`rounded-xl border p-4 ${item.is_read ? "border-gray-200 bg-white" : "border-[#E53E3E]/20 bg-[#FFF7F7]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-[#1A365D] dark:text-white">{item.title}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.message}</div>
                </div>
                <div className="text-xs text-gray-500">{formatTime(item.created_at)}</div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.type ?? "System Announcement"}</div>
                {!item.is_read && (
                  <Button variant="outline" size="sm" onClick={() => void handleMarkRead(item.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </Button>
        <div className="text-sm text-gray-500">Page {page}</div>
        <Button variant="ghost" size="sm" onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>
    </Card>
  );
}
