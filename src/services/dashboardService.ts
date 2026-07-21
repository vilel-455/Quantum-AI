import { supabase } from "../lib/supabase";

export type DashboardStats = {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeInvestments: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalProfitPaid: number;
  platformBalance: number;
};

export type RecentUser = {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  created_at: string | null;
};

export type RecentTransactionRow = {
  id: string;
  type: "deposit" | "withdrawal";
  user_id: string;
  amount: number;
  status: string;
  created_at: string | null;
};


function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}



export async function getPlatformBalance(): Promise<number> {
  try {
    const { data, error } = await supabase.from("wallets").select("balance,profit_balance,bonus_balance");
    if (error) return 0;
    const rows = data ?? [];
    return rows.reduce((acc, row) => {
      const bal = safeNumber((row as any).balance, 0);
      const profitBal = safeNumber((row as any).profit_balance, 0);
      const bonusBal = safeNumber((row as any).bonus_balance, 0);
      return acc + bal + profitBal + bonusBal;
    }, 0);
  } catch {
    return 0;
  }
}

export async function getPendingCounts(): Promise<{
  pendingDeposits: number;
  pendingWithdrawals: number;
}> {
  try {
const [{ count: pendingDeposits }, { count: pendingWithdrawals }] =
      await Promise.all([
        supabase
          .from("deposits")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("withdrawals")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ] as const);


    return {
      pendingDeposits: typeof pendingDeposits === "number" ? pendingDeposits : 0,
      pendingWithdrawals:
        typeof pendingWithdrawals === "number" ? pendingWithdrawals : 0,
    };
  } catch {
    return { pendingDeposits: 0, pendingWithdrawals: 0 };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [{ count: totalUsers }, totalProfitPaid, platformBalance, pendingCounts] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        (async () => {
          try {
            const { data, error } = await supabase
              .from("transactions")
              .select("sum(amount) as sum")
              .eq("type", "profit")
              .eq("status", "completed")
              .maybeSingle();
            if (error) return 0;
            return safeNumber((data as any)?.sum, 0);
          } catch {
            return 0;
          }
        })(),
        getPlatformBalance(),
        getPendingCounts(),
      ]);

    const [depositAgg, withdrawalAgg, activeInvestmentsRes] = await Promise.all([
      (async () => {
        try {
          const { data, error } = await supabase
            .from("deposits")
            .select("sum(amount) as sum")
            .eq("status", "approved")
            .maybeSingle();
          if (error) return 0;
          return safeNumber((data as any)?.sum, 0);
        } catch {
          return 0;
        }
      })(),
      (async () => {
        try {
          const { data, error } = await supabase
            .from("withdrawals")
            .select("sum(amount) as sum")
            .eq("status", "approved")
            .maybeSingle();
          if (error) return 0;
          return safeNumber((data as any)?.sum, 0);
        } catch {
          return 0;
        }
      })(),
      (async () => {
        try {
          const { count, error } = await supabase
            .from("investments")
            .select("id", { count: "exact", head: true })
            .eq("status", "Active");
          if (error) return 0;
          return typeof count === "number" ? count : 0;
        } catch {
          return 0;
        }
      })(),
    ]);

    return {
      totalUsers: typeof totalUsers === "number" ? totalUsers : 0,
      totalDeposits: depositAgg,
      totalWithdrawals: withdrawalAgg,
      activeInvestments: activeInvestmentsRes,
      pendingDeposits: pendingCounts.pendingDeposits,
      pendingWithdrawals: pendingCounts.pendingWithdrawals,
      totalProfitPaid,
      platformBalance,
    };
  } catch {
    return {
      totalUsers: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activeInvestments: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      totalProfitPaid: 0,
      platformBalance: 0,
    };
  }
}

export async function getRecentUsers(limit: number): Promise<RecentUser[]> {
  try {
    const { data, error } = await supabase
      .from<RecentUser>("profiles")
      .select("id,email,username,full_name,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentTransactions(limit: number): Promise<RecentTransactionRow[]> {
  try {
    const [depositsRes, withdrawalsRes] = await Promise.all([
      supabase
        .from("deposits")
        .select("id,user_id,amount,status,created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("withdrawals")
        .select("id,user_id,amount,status,created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const deposits = (depositsRes.data ?? []) as any[];
    const withdrawals = (withdrawalsRes.data ?? []) as any[];

const mapped: RecentTransactionRow[] = [
      ...deposits.map((d) => ({
        id: String(d.id),
        type: "deposit" as const,
        user_id: String(d.user_id),
        amount: safeNumber(d.amount, 0),
        status: String(d.status ?? ""),
        created_at: d.created_at ? String(d.created_at) : null,
      })),
      ...withdrawals.map((w) => ({
        id: String(w.id),
        type: "withdrawal" as const,
        user_id: String(w.user_id),
        amount: safeNumber(w.amount, 0),
        status: String(w.status ?? ""),
        created_at: w.created_at ? String(w.created_at) : null,
      })),
    ];


    mapped.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    return mapped.slice(0, limit);
  } catch {
    return [];
  }
}

