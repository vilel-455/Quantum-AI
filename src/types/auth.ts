export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  country: string;
  referral_code: string | null;
  role?: "admin" | "user";
  account_status?: "active" | "inactive" | "suspended" | string;
  verification_status?: "verified" | "pending" | "rejected" | string;
  wallet_balance: number;
  profit_balance: number;
  bonus_balance: number;
  kyc_status: string;
  investment_plan: string | null;
  created_at: string;
}

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  profit_balance: number;
  bonus_balance: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
};

export type Investment = {
  id: string;
  user_id: string;
  plan_id: string | null;
  amount: number;
  status: string;
  started_at?: string;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at?: string;
};

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "profit"
  | "referral_bonus"
  | "admin_adjustment";

export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  status: TransactionStatus;
  reference: string | null;
  balance_before: number | null;
  balance_after: number | null;
  created_at?: string;
}
