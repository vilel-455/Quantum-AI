import { supabase } from './supabase';
import type { Wallet } from '../types/auth';

function parseNumeric(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Invalid numeric wallet value.');
  }
  return parsed;
}

export async function getWallet(userId: string): Promise<Wallet> {
  const { data, error } = await supabase
    .from<Wallet>('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to load wallet.');
  }

  if (!data) {
    throw new Error('Wallet not found. Please contact support.');
  }

  return data;
}

export async function deductWalletBalance(userId: string, amount: number): Promise<Wallet> {
  const wallet = await getWallet(userId);
  const currentBalance = parseNumeric(wallet.balance);
  const newBalance = currentBalance - amount;

  if (newBalance < 0) {
    throw new Error('Insufficient wallet balance.');
  }

  const { data, error } = await supabase
    .from<Wallet>('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Unable to update wallet balance.');
  }

  if (!data) {
    throw new Error('Wallet update failed.');
  }

  return data;
}
