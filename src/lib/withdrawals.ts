import { supabase } from "./supabase";
import type { Withdrawal, WithdrawalPaymentMethod, WithdrawalStatus } from "../types/withdrawals";
import { getWallet } from "./wallets";
import { emitTransactionRefresh } from "./transactions";

export interface CreateWithdrawalInput {
  userId: string;
  amount: number;
  withdrawal_method: WithdrawalPaymentMethod;
  account_name?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  wallet_address?: string | null;
  network?: string | null;
  /** Optional: if true, prevents another pending withdrawal for this user by re-using the same amount+method+wallet address.
   *  (This behavior depends on DB settings; we also enforce it defensively client-side.)
   */
  preventDuplicatePending?: boolean;
}

function normalizeNumeric(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Invalid numeric value.");
  return parsed;
}

function assertWithdrawalStatus(status: string): asserts status is WithdrawalStatus {
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    throw new Error("Invalid withdrawal status.");
  }
}

async function getWithdrawalMinMax(): Promise<{ min: number; max: number; duplicatePending: boolean }> {
  // App may not yet use platform_settings for min/max; provide safe defaults.
  const defaults = { min: 0, max: Number.POSITIVE_INFINITY, duplicatePending: false };

  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("minimum_withdrawal,withdrawal_fee")
      .maybeSingle();

    if (error) return defaults;
    if (!data) return defaults;

    const min = data.minimum_withdrawal ? normalizeNumeric(data.minimum_withdrawal) : 0;

    // No maximum setting in DB template; keep infinity.
    return { min, max: defaults.max, duplicatePending: defaults.duplicatePending };
  } catch {
    return defaults;
  }
}

function hasMeaningfulAddress(addr?: string | null): boolean {
  return typeof addr === "string" && addr.trim().length > 0;
}

export async function createWithdrawal(input: CreateWithdrawalInput): Promise<Withdrawal> {
  const amount = normalizeNumeric(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount. Amount must be greater than 0.");
  }

  const { min, max, duplicatePending } = await getWithdrawalMinMax();

  if (amount < min) {
    throw new Error(`Minimum withdrawal is ${min}.`);
  }
  if (amount > max) {
    throw new Error(`Maximum withdrawal is ${max}.`);
  }

  const wallet = await getWallet(input.userId);
  const balance = normalizeNumeric(wallet.balance);

  if (balance < amount) {
    throw new Error("Insufficient wallet balance.");
  }

  const { data: pendingSame, error: pendingError } = await supabase
    .from<Withdrawal>("withdrawals")
    .select("id,status")
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .limit(1);

  if (pendingError) {
    throw new Error(pendingError.message || "Unable to validate pending withdrawals.");
  }

  if ((input.preventDuplicatePending ?? duplicatePending) && (pendingSame?.length ?? 0) > 0) {
    throw new Error("Duplicate request: you already have a pending withdrawal.");
  }

  const payload = {
    user_id: input.userId,
    amount,
    withdrawal_method: input.withdrawal_method,
    account_name: input.account_name ?? null,
    account_number: input.account_number ?? null,
    bank_name: input.bank_name ?? null,
    wallet_address: input.wallet_address ?? null,
    network: input.network ?? null,
    status: "pending" as const,
  };

  const { data, error } = await supabase
    .from<Withdrawal>("withdrawals")
    .insert([payload])
    .select("*")
    .single();

  if (error) throw new Error(error.message || "Unable to create withdrawal.");
  if (!data) throw new Error("Withdrawal creation failed.");

  assertWithdrawalStatus(data.status);

  return data;
}

export async function getUserWithdrawals(userId: string, limit = 50): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from<Withdrawal>("withdrawals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message || "Unable to load withdrawals.");

  return data ?? [];
}

export async function getPendingWithdrawals(limit = 50): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from<Withdrawal>("withdrawals")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message || "Unable to load pending withdrawals.");

  return data ?? [];
}

export async function getWithdrawal(id: string): Promise<Withdrawal> {
  const { data, error } = await supabase
    .from<Withdrawal>("withdrawals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load withdrawal.");
  if (!data) throw new Error("Withdrawal not found.");

  assertWithdrawalStatus(data.status);
  return data;
}

import {
  approveWithdrawal as adminApproveWithdrawal,
  rejectWithdrawal as adminRejectWithdrawal,
} from "./adminService";

export async function approveWithdrawal(withdrawalId: string, adminNote?: string): Promise<void> {
  void adminNote;
  const res = await adminApproveWithdrawal(withdrawalId);
  if (!res.ok) throw new Error(res.error.message);
}

export async function rejectWithdrawal(withdrawalId: string, adminNote?: string): Promise<void> {
  const reason = adminNote ?? "Rejected by admin.";
  const res = await adminRejectWithdrawal(withdrawalId, reason);
  if (!res.ok) throw new Error(res.error.message);
}


