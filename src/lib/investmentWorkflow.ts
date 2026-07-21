import { getPlan } from "./plans";

export function parseAmount(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter an amount.");
  }

  // Allow "1,234.56" and similar.
  const normalized = trimmed.replace(/,/g, "");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid investment amount.");
  }

  return amount;
}

export function validateAmountAgainstPlan({
  amount,
  planMin,
  planMax,
}: {
  amount: number;
  planMin: number;
  planMax: number | null;
}): { ok: true } | { ok: false; message: string } {
  if (amount < planMin) {
    return { ok: false, message: `Amount must be at least ${planMin}.` };
  }

  if (planMax !== null && amount > planMax) {
    return { ok: false, message: `Amount must be at most ${planMax}.` };
  }

  return { ok: true };
}

export async function validatePlanAndAmount({
  planId,
  amount,
  walletBalance,
}: {
  planId: string;
  amount: number;
  walletBalance: number;
}) {
  const plan = await getPlan(planId);

  const minMax = validateAmountAgainstPlan({
    amount,
    planMin: plan.minimum,
    planMax: plan.maximum,
  });

  if (!minMax.ok) {
    return { ok: false as const, message: minMax.message };
  }

  if (amount > walletBalance) {
    return { ok: false as const, message: "Insufficient wallet balance." };
  }

  return { ok: true as const, plan };
}
