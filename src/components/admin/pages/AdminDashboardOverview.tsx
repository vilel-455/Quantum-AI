import React from 'react';
import { Avatar, Button, LoadingSkeleton, StatCard } from '../../../design-system';
import { AdminLayout } from '../AdminLayout';
import { sendAnnouncement } from '../../../lib/adminService';
import {
  getDashboardStats,
  getRecentTransactions,
  getRecentUsers,
  type DashboardStats,
  type RecentTransactionRow,
  type RecentUser,
} from '../../../services/dashboardService';

function formatCompactNumber(value: number): string {
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
  } catch {
    return String(value);
  }
}

export function AdminDashboardOverview() {
  const [target, setTarget] = React.useState<'all' | 'user'>('all');
  const [userId, setUserId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  const [loadingStats, setLoadingStats] = React.useState(true);
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeInvestments: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalProfitPaid: 0,
    platformBalance: 0,
  });

  const [recentUsersLoading, setRecentUsersLoading] = React.useState(true);
  const [recentUsers, setRecentUsers] = React.useState<RecentUser[]>([]);

  const [recentTransactionsLoading, setRecentTransactionsLoading] = React.useState(true);
  const [recentTransactions, setRecentTransactions] = React.useState<RecentTransactionRow[]>([]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);
    const result = await sendAnnouncement(
      target,
      target === 'user' ? userId : null,
      title,
      message,
    );
    setIsSending(false);
setStatus(result.ok ? 'Announcement sent.' : result.error?.message ?? 'Unable to send announcement.');
  };

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoadingStats(true);
      setRecentUsersLoading(true);
      setRecentTransactionsLoading(true);

      const safeSetStats = (next: DashboardStats) => {
        if (!isMounted) return;
        setDashboardStats(next);
      };

      const safeSetUsers = (next: RecentUser[]) => {
        if (!isMounted) return;
        setRecentUsers(next);
      };

      const safeSetTx = (next: RecentTransactionRow[]) => {
        if (!isMounted) return;
        setRecentTransactions(next);
      };

      try {
        const [stats, users, txs] = await Promise.all([
          getDashboardStats(),
          getRecentUsers(5),
          getRecentTransactions(6),
        ]);

        safeSetStats(stats);
        safeSetUsers(users);
        safeSetTx(txs);
      } catch {
        // service already returns safe defaults; keep UI stable.
      } finally {
        if (!isMounted) return;
        setLoadingStats(false);
        setRecentUsersLoading(false);
        setRecentTransactionsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards: Array<{ label: string; value: string }> = [
    { label: 'Total Users', value: formatCompactNumber(dashboardStats.totalUsers) },
    {
      label: 'Total Deposits',
      value: formatCompactNumber(dashboardStats.totalDeposits),
    },
    {
      label: 'Total Withdrawals',
      value: formatCompactNumber(dashboardStats.totalWithdrawals),
    },
    {
      label: 'Active Investments',
      value: formatCompactNumber(dashboardStats.activeInvestments),
    },
    {
      label: 'Pending Deposits',
      value: formatCompactNumber(dashboardStats.pendingDeposits),
    },
    {
      label: 'Pending Withdrawals',
      value: formatCompactNumber(dashboardStats.pendingWithdrawals),
    },
    {
      label: 'Total Profit Paid',
      value: formatCompactNumber(dashboardStats.totalProfitPaid),
    },
    {
      label: 'Total Platform Balance',
      value: formatCompactNumber(dashboardStats.platformBalance),
    },
  ];

  return (
    <AdminLayout activeNav="admin_dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">Admin Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold">Overview</h1>
          <p className="mt-2 text-sm text-white/70">Operational metrics and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              loading={loadingStats}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-white font-semibold">Recent Users</div>
            <div className="mt-4">
              {recentUsersLoading ? (
                <LoadingSkeleton variant="card" />
              ) : recentUsers.length === 0 ? (
                <div className="text-sm text-white/60">No recent users.</div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => {
                    const name = u.full_name || u.username || 'User';
                    const createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString() : '—';
                    return (
                      <div key={u.id} className="flex items-center gap-3">
                        <Avatar alt={name} fallback={u.username ?? name} size="md" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{name}</div>
                          <div className="truncate text-xs text-white/60">{u.email ?? '—'}</div>
                          <div className="text-xs text-white/50">{createdAt}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-white font-semibold">Recent Deposits & Withdrawals</div>
            <div className="mt-4">
              {recentTransactionsLoading ? (
                <div className="space-y-3">
                  <LoadingSkeleton variant="text" lines={4} className="" />
                  <LoadingSkeleton variant="text" lines={4} />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-sm text-white/60">No recent transactions.</div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((t) => {
                    const dateStr = t.created_at ? new Date(t.created_at).toLocaleString() : '—';
                    return (
                      <div key={t.id} className="rounded-xl border border-white/10 bg-[#081120]/30 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{t.type}</div>
                          <div className="text-sm font-semibold text-[#E53E3E]">{formatCompactNumber(t.amount)}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <div className="text-xs text-white/60">{t.status}</div>
                          <div className="text-xs text-white/50">{dateStr}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-white font-semibold">Announcement Panel</div>
          <p className="mt-2 text-sm text-white/70">Send announcements to all users or a single user. These create notification records and are safe to use without email configuration.</p>
          <form className="mt-4 space-y-3" onSubmit={handleSend}>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="radio" checked={target === 'all'} onChange={() => setTarget('all')} />
                All users
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="radio" checked={target === 'user'} onChange={() => setTarget('user')} />
                One user
              </label>
            </div>
            {target === 'user' ? (
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="User ID"
                className="w-full rounded-xl border border-white/10 bg-[#081120] px-3 py-2 text-sm text-white outline-none"
              />
            ) : null}
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="w-full rounded-xl border border-white/10 bg-[#081120] px-3 py-2 text-sm text-white outline-none"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-[#081120] px-3 py-2 text-sm text-white outline-none"
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={isSending}>
                Send announcement
              </Button>
              {status ? <span className="text-sm text-white/80">{status}</span> : null}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}


