import { supabase } from "./supabase";
import { createTransaction } from "./transactions";
import type { Investment, Wallet } from "../types/auth";
import { getPlan } from "./plans";

export type ProfitPayoutStrategy =
  | {
      type: "daily_payout";
    }
  | {
      type: "end_of_plan_payout";
    };

export type ProfitEngineConfig = {
  payoutStrategy: ProfitPayoutStrategy;
};

export type ProfitCalculationResult = {
  dailyRoiPercent: number;
  remainingDays: number;
  progressPercent: number;
  currentEarnedProfit: number;
  completedProfit: number;
};

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new Error("Invalid numeric value.");
  }
  return n;
}

function roundMoney(n: number): number {
  // Keep precision deterministic for ledger/UI
  return Math.round(n * 100) / 100;
}

function daysBetween(now: Date, endsAt: Date | null | undefined): number {
  if (!endsAt) return 0;
  const ms = endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function computeStartedAt(investment: Investment): Date {
  const started = safeDate((investment as any).started_at);
  if (started) return started;
  // Fallback to created_at if started_at missing
  const created = safeDate((investment as any).created_at);
  if (created) return created;
  return new Date();
}

function computeEndsAt(investment: Investment): Date | null {
  return safeDate((investment as any).ends_at);
}

export function calculateProfit({
  investment,
  plan,
  now = new Date(),
}: {
  investment: Investment;
  plan: Awaited<ReturnType<typeof getPlan>>;
  now?: Date;
}): ProfitCalculationResult {
  if (!investment.amount) {
    throw new Error("Investment missing amount.");
  }

  const roiPercent = toNumber(plan.roi_percent);
  const durationDays = Math.max(1, Math.floor(toNumber(plan.duration_days)));
  const amount = toNumber(investment.amount);

  const dailyRoiPercent = roiPercent / durationDays;

  const startedAt = computeStartedAt(investment);
  const endsAt = computeEndsAt(investment);

  // If ends_at is missing, treat as not progressed.
  const progressBaseDays = endsAt
    ? Math.max(1, Math.floor(toNumber(plan.duration_days)))
    : durationDays;

  const elapsedMs = now.getTime() - startedAt.getTime();
  const elapsedDays = Math.max(0, elapsedMs / (24 * 60 * 60 * 1000));

  const progressPercent = roundMoney(
    clamp01(elapsedDays / progressBaseDays) * 100,
  );

  const remainingDays = endsAt
    ? daysBetween(now, endsAt)
    : Math.max(0, durationDays - Math.floor(elapsedDays));

  const completedProfit = roundMoney((amount * roiPercent) / 100);

  // Earned-to-date assumes linear ROI accrual.
  const currentEarnedProfit = roundMoney(
    (completedProfit * clamp01(elapsedDays / durationDays)) as number,
  );

  return {
    dailyRoiPercent,
    remainingDays,
    progressPercent,
    currentEarnedProfit,
    completedProfit,
  };
}

async function loadWalletForUser(userId: string): Promise<Wallet> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load wallet.");
  if (!data) throw new Error("Wallet not found.");
  return data;
}

export async function creditProfit({
  userId,
  amount,
  reference,
  description = "Investment Profit",
}: {
  userId: string;
  amount: number;
  reference: string;
  description?: string;
}): Promise<void> {
  if (!(amount > 0)) return;

  const wallet = await loadWalletForUser(userId);
  const balanceBefore = toNumber(wallet.balance);
  const currentProfitBalance = toNumber((wallet as any).profit_balance ?? 0);

  const amountRounded = roundMoney(amount);

  // Prevent negative balance risk for profit credit by only increasing.
  const newProfitBalance = roundMoney(currentProfitBalance + amountRounded);

  // Update wallets.total_profit equivalent: project uses profit_balance.
  const { error } = await supabase
    .from<Wallet>("wallets")
    .update({
      profit_balance: newProfitBalance,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message || "Unable to credit profit.");
  }

  await createTransaction({
    userId,
    type: "profit",
    amount: amountRounded,
    description,
    status: "completed",
    reference,
    balanceBefore,
    balanceAfter: balanceBefore,
  });
}

async function hasCompletedProfitTransaction({
  investmentId,
}: {
  investmentId: string;
}): Promise<boolean> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id")
    .eq("type", "profit")
    .eq("reference", investmentId)
    .eq("status", "completed")
    .limit(1);

  if (error) throw new Error(error.message || "Unable to check profit tx.");
  return (data ?? []).length > 0;
}

export async function processInvestment({
  investment,
  config,
  now = new Date(),
  strategy,
}: {
  investment: Investment;
  config: ProfitEngineConfig;
  now?: Date;
  strategy?: ProfitPayoutStrategy;
}): Promise<{
  calculation: ProfitCalculationResult;
  creditedProfit: number;
  didCredit: boolean;
}> {
  const planId = investment.plan_id;
  if (!planId) {
    throw new Error("Investment missing plan_id.");
  }

  if (investment.status?.toLowerCase?.() !== "active") {
    throw new Error("Investment is not active.");
  }

  const plan = await getPlan(planId);
  const calculation = calculateProfit({ investment, plan, now });

  const payoutStrategy = strategy ?? config.payoutStrategy;

  const endsAt = computeEndsAt(investment);
  const isPlanComplete = endsAt ? now.getTime() >= endsAt.getTime() : false;

  // Daily payout strategy can be extended later; for now we only credit at completion
  // because the DB/infrastructure likely supports completion-credit flow.
  // This still returns correct calculation for UI/scheduler.
  let creditedProfit = 0;
  let didCredit = false;

  if (payoutStrategy.type === "end_of_plan_payout") {
    if (!isPlanComplete) {
      return { calculation, creditedProfit: 0, didCredit: false };
    }

    if (await hasCompletedProfitTransaction({ investmentId: investment.id })) {
      return { calculation, creditedProfit: 0, didCredit: false };
    }

    creditedProfit = calculation.completedProfit;
    await creditProfit({
      userId: investment.user_id,
      amount: creditedProfit,
      reference: investment.id,
      description: "Investment Profit",
    });

    didCredit = true;
  }

  return { calculation, creditedProfit, didCredit };
}

export async function processCompletedInvestments({
  config,
  batchSize = 25,
  now = new Date(),
}: {
  config: ProfitEngineConfig;
  batchSize?: number;
  now?: Date;
}): Promise<{ processed: number; completed: number }>
  {
  // Only process investments that are active and ended.
  // We do this in two stages to keep business logic reusable.
  const { data, error } = await supabase
    .from<Investment>("investments")
    .select("*")
    .eq("status", "Active")
    .not("ends_at", "is", null)
    .lte("ends_at", now.toISOString())
    .limit(batchSize);

  if (error) {
    throw new Error(error.message || "Unable to load completed investments.");
  }

  const investments = data ?? [];
  let processed = 0;
  let completed = 0;

  for (const investment of investments) {
    processed += 1;

    const planId = investment.plan_id;
    if (!planId) continue;

    const alreadyTx = await hasCompletedProfitTransaction({
      investmentId: investment.id,
    });

    // Credit once (idempotent), then complete investment.
    if (!alreadyTx || config.payoutStrategy.type === "daily_payout") {
      const result = await processInvestment({ investment, config, now });
      if (result.didCredit) {
        // credited
      }
    }

    // Mark completed idempotently.
    if (investment.status?.toLowerCase?.() === "completed") {
      completed += 1;
      continue;
    }

    // Prevent interrupted processing: check if completed_at already exists.
    const completedAt = (investment as any).completed_at;
    if (completedAt) {
      completed += 1;
      continue;
    }

    const { error: updErr } = await supabase
      .from<Investment>("investments")
      .update({
        status: "completed",
        completed_at: now.toISOString(),
      })
      .eq("id", investment.id);

    if (updErr) {
      throw new Error(updErr.message || "Unable to mark investment completed.");
    }

    completed += 1;
  }

  return { processed, completed };
}

