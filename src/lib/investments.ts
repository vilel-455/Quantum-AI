import { supabase } from "./supabase";
import type { Investment, Wallet } from "../types/auth";
import { createTransaction } from "./transactions";

export async function createInvestment(
  userId: string,
  planId: string,
  amount: number,
): Promise<Investment> {
  const { data: walletData, error: walletError } = await supabase
    .from<Wallet>("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (walletError) {
    throw new Error(walletError.message || "Unable to load wallet.");
  }

  if (!walletData) {
    throw new Error("Wallet not found. Please contact support.");
  }

  const balanceBefore = Number(walletData.balance);
  if (Number.isNaN(balanceBefore)) {
    throw new Error("Invalid wallet balance.");
  }

  if (balanceBefore < amount) {
    throw new Error("Insufficient wallet balance.");
  }

  const { data: investment, error: investmentError } = await supabase
    .from<Investment>("investments")
    .insert([
      {
        user_id: userId,
        plan_id: planId,
        amount,
      },
    ])
    .select("*")
    .single();

  if (investmentError) {
    throw new Error(investmentError.message || "Unable to create investment.");
  }

  if (!investment) {
    throw new Error("Investment creation failed.");
  }

  const balanceAfter = balanceBefore - amount;
  let walletUpdated = false;

  try {
    const { error: updateError } = await supabase
      .from<Wallet>("wallets")
      .update({ balance: balanceAfter })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(
        updateError.message || "Unable to update wallet balance.",
      );
    }

    walletUpdated = true;

    await createTransaction({
      userId,
      type: "investment",
      amount,
      description: `Investment created for plan ${planId}`,
      status: "completed",
      reference: investment.id,
      balanceBefore,
      balanceAfter,
    });

    return investment;
  } catch (error) {
    if (walletUpdated) {
      await supabase
        .from<Wallet>("wallets")
        .update({ balance: balanceBefore })
        .eq("user_id", userId);
    }

    await supabase
      .from<Investment>("investments")
      .delete()
      .eq("id", investment.id);

    throw error instanceof Error
      ? error
      : new Error("Unable to complete investment.");
  }
}

export async function getUserInvestments(
  userId: string,
): Promise<Investment[]> {
  const { data, error } = await supabase
    .from<Investment>("investments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load investments.");
  }

  return data ?? [];
}

export async function getInvestment(id: string): Promise<Investment> {
  const { data, error } = await supabase
    .from<Investment>("investments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load investment.");
  }

  if (!data) {
    throw new Error("Investment not found.");
  }

  return data;
}

export async function cancelInvestment(id: string): Promise<Investment> {
  const { data, error } = await supabase
    .from<Investment>("investments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to cancel investment.");
  }

  if (!data) {
    throw new Error("Investment cancellation failed.");
  }

  return data;
}
