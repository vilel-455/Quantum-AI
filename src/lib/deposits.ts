import { supabase } from "./supabase";
import type {
  Deposit,
  DepositPaymentMethod,
  DepositStatus,
} from "../types/deposits";

export interface CreateDepositInput {
  userId: string;
  amount: number;
  payment_method: DepositPaymentMethod;
  proof_url: string;
  transaction_reference?: string | null;
}

export async function createDeposit(
  input: CreateDepositInput,
): Promise<Deposit> {
  const payload = {
    user_id: input.userId,
    amount: input.amount,
    payment_method: input.payment_method,
    proof_url: input.proof_url,
    transaction_reference: input.transaction_reference ?? null,
    status: "pending" as const,
  };

  const { data, error } = await supabase
    .from("deposits")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create deposit.");
  }

  if (!data) {
    throw new Error("Deposit creation failed.");
  }

  return data;
}

export async function getUserDeposits(
  userId: string,
  limit = 50,
): Promise<Deposit[]> {
  const { data, error } = await supabase
    .from<Deposit>("deposits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || "Unable to load deposits.");
  }

  return data ?? [];
}

export async function getPendingDeposits(): Promise<Deposit[]> {
  const { data, error } = await supabase
    .from<Deposit>("deposits")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load pending deposits.");
  }

  return data ?? [];
}

export async function getDepositsByStatus(
  status: DepositStatus,
): Promise<Deposit[]> {
  const { data, error } = await supabase
    .from<Deposit>("deposits")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load deposits.");
  }

  return data ?? [];
}

export async function getDeposit(id: string): Promise<Deposit> {
  const { data, error } = await supabase
    .from<Deposit>("deposits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load deposit.");
  }

  if (!data) {
    throw new Error("Deposit not found.");
  }

  return data;
}

import {
  approveDeposit as adminApproveDeposit,
  rejectDeposit as adminRejectDeposit,
} from "./adminService";

export async function approveDeposit(
  depositId: string,
  adminNote?: string,
): Promise<void> {
  // adminNote is used as admin reject/approve note.
  // adminService keeps approveDeposit signature without note for now;
  // preserve existing API by mapping note into reject reason when rejecting.
  void adminNote;
  const res = await adminApproveDeposit(depositId);
  if (!res.ok) throw new Error(res.error.message);
}

export async function rejectDeposit(
  depositId: string,
  adminNote?: string,
): Promise<void> {
  const reason = adminNote ?? "Rejected by admin.";
  const res = await adminRejectDeposit(depositId, reason);
  if (!res.ok) throw new Error(res.error.message);
}


