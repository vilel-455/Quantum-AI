import { supabase } from "./supabase";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../types/auth";

export interface CreateTransactionInput {
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  status?: TransactionStatus;
  reference?: string | null;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
}

function normalizeNumeric(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    amount: normalizeNumeric(transaction.amount) ?? 0,
    balance_before: normalizeNumeric(transaction.balance_before),
    balance_after: normalizeNumeric(transaction.balance_after),
  };
}

export function emitTransactionRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("transactions:updated"));
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const payload = {
    user_id: input.userId,
    type: input.type,
    amount: input.amount,
    description: input.description ?? null,
    status: input.status ?? "completed",
    reference: input.reference ?? null,
    balance_before: input.balanceBefore ?? null,
    balance_after: input.balanceAfter ?? null,
  };

  const { data, error } = await supabase
    .from<Transaction>("transactions")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create transaction.");
  }

  if (!data) {
    throw new Error("Transaction creation failed.");
  }

  return normalizeTransaction(data);
}

export async function getUserTransactions(
  userId: string,
  limit = 25,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from<Transaction>("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || "Unable to load transactions.");
  }

  return (data ?? []).map((item) => normalizeTransaction(item));
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from<Transaction>("transactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load transaction.");
  }

  if (!data) {
    throw new Error("Transaction not found.");
  }

  return normalizeTransaction(data);
}

export async function getRecentTransactions(
  userId: string,
  limit = 10,
): Promise<Transaction[]> {
  return getUserTransactions(userId, limit);
}
