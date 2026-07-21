export type DepositPaymentMethod =
  | "bank_transfer"
  | "usdt_trc20"
  | "bitcoin"
  | "ethereum";

export type DepositStatus = "pending" | "approved" | "rejected";

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: DepositPaymentMethod;
  proof_url: string | null;
  transaction_reference: string | null;
  status: DepositStatus;
  admin_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at?: string;
  updated_at?: string;
}

