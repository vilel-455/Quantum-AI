import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';

type ProfileFallback = {
  email?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  country?: string;
  referral?: string | null;
};

export type AuthProfile = {
  id: string;
  email?: string;
  username?: string;
  role?: 'admin' | 'user';
  account_status?: 'active' | 'inactive' | 'suspended' | string;
  verification_status?: 'verified' | 'pending' | 'rejected' | string;
};

async function getProfile(userId: string): Promise<AuthProfile | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('PROFILE ERROR:', profileError);
    throw new Error('Unable to verify your profile. Please contact support.');
  }

  return profile as AuthProfile | null;
}

async function verifyWalletExists(userId: string): Promise<void> {
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (walletError) {
    console.error('WALLET ERROR:', walletError);
    throw new Error('Unable to verify your wallet. Please contact support.');
  }

  if (!wallet) {
    throw new Error(
      'Your wallet record is not yet provisioned. Please contact support to complete account setup.',
    );
  }
}

export async function ensureAuthRecords(
  user: SupabaseUser,
  fallback?: ProfileFallback,
): Promise<AuthProfile> {
  const profile = await getProfile(user.id);

  if (!profile) {
    throw new Error(
      'Your profile record is missing. Please contact support to complete account setup.',
    );
  }

  if (profile.id !== user.id) {
    throw new Error('Your profile is not linked correctly. Please contact support.');
  }

  await verifyWalletExists(user.id);
  return profile;
}
