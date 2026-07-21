export type WithdrawalStatus = "pending" | "approved" | "rejected";

export type WithdrawalPaymentMethod =
  | "bank_transfer"
  | "card"
  | "crypto"
  | "other";

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string | null;
  network: string | null;
  withdrawal_method: WithdrawalPaymentMethod;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  status: WithdrawalStatus;
  admin_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at?: string;
  updated_at?: string;
};

