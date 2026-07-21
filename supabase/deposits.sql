-- Deposit system (STEP 9G)
-- Production-grade deposits with admin approval workflow.
--
-- Assumptions based on existing repo:
-- - public.transactions exists with columns used by src/lib/transactions.ts
-- - public.wallets exists
-- - public.profiles exists with role/account_status/verification_status
--
-- Run this file in Supabase SQL editor.

create extension if not exists pgcrypto;

-- ============================================================
-- 1) wallets.total_deposit (required by approval logic)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='wallets'
      AND column_name='total_deposit'
  ) THEN
    ALTER TABLE public.wallets
      ADD COLUMN total_deposit numeric(20,8) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- 2) deposits table (exact spec)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='public'
      AND table_name='deposits'
  ) THEN
    CREATE TABLE public.deposits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      amount numeric(20,8) NOT NULL CHECK (amount > 0),
      payment_method text NOT NULL,
      proof_url text,
      transaction_reference text,
      status text DEFAULT 'pending',
      admin_note text,
      approved_by uuid NULL,
      approved_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      CONSTRAINT deposits_payment_method_check CHECK (
        payment_method in ('bank_transfer', 'usdt_trc20', 'bitcoin', 'ethereum')
      ),
      CONSTRAINT deposits_status_check CHECK (
        status in ('pending', 'approved', 'rejected')
      )
    );
  END IF;
END $$;

-- If deposits table exists (possibly from earlier template), enforce missing columns safely.
DO $$
BEGIN
  -- payment_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='payment_method'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN payment_method text NOT NULL DEFAULT 'bank_transfer';
  END IF;

  -- transaction_reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='transaction_reference'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN transaction_reference text;
  END IF;

  -- admin_note
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='admin_note'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN admin_note text;
  END IF;

  -- proof_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='proof_url'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN proof_url text;
  END IF;

  -- approved_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='approved_by'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN approved_by uuid;
  END IF;

  -- approved_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='approved_at'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN approved_at timestamptz;
  END IF;

  -- status default + constraint
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='status'
  ) THEN
    ALTER TABLE public.deposits
      ALTER COLUMN status SET DEFAULT 'pending';
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deposits' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS deposits_status_idx ON public.deposits(status);
CREATE INDEX IF NOT EXISTS deposits_created_at_idx ON public.deposits(created_at DESC);

-- ============================================================
-- 3) updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deposits_set_updated_at ON public.deposits;
CREATE TRIGGER deposits_set_updated_at
BEFORE UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION private.set_updated_at();

-- ============================================================
-- 4) RLS
-- ============================================================
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users: view own deposits
DROP POLICY IF EXISTS "deposits_self_read" ON public.deposits;
CREATE POLICY "deposits_self_read"
  ON public.deposits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users: insert own deposits
DROP POLICY IF EXISTS "deposits_self_insert" ON public.deposits;
CREATE POLICY "deposits_self_insert"
  ON public.deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users: no update/delete/approve/reject (no policy => deny)

-- Admins: read any deposits
DROP POLICY IF EXISTS "deposits_admin_read" ON public.deposits;
CREATE POLICY "deposits_admin_read"
  ON public.deposits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- Admins: approve/reject (update)
DROP POLICY IF EXISTS "deposits_admin_update" ON public.deposits;
CREATE POLICY "deposits_admin_update"
  ON public.deposits
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- ============================================================
-- 5) Approval logic (function) + trigger
-- ============================================================
-- We keep client updates minimal: admin calls approveDeposit/rejectDeposit
-- via function which performs wallet + ledger + deposit update atomically.

CREATE OR REPLACE FUNCTION public.approve_deposit(
  p_deposit_id uuid,
  p_admin_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dep RECORD;
  wallet RECORD;
  balance_before numeric(20,8);
BEGIN
  -- Ensure caller is admin (run-time check)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Not authorized to approve deposits.';
  END IF;

  SELECT * INTO dep FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
  IF dep.id IS NULL THEN
    RAISE EXCEPTION 'Deposit not found.';
  END IF;

  IF dep.status <> 'pending' THEN
    RAISE EXCEPTION 'Deposit is not pending.';
  END IF;

  SELECT * INTO wallet FROM public.wallets WHERE user_id = dep.user_id FOR UPDATE;
  IF wallet.user_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for this user.';
  END IF;

  balance_before := wallet.balance;

  -- Move balances
  UPDATE public.wallets
  SET
    balance = balance + dep.amount,
    total_deposit = total_deposit + dep.amount
  WHERE user_id = dep.user_id;

  -- Reload new balance
  SELECT balance INTO balance_before FROM public.wallets WHERE user_id = dep.user_id;
  -- balance_after is current balance

  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    status,
    reference,
    balance_before,
    balance_after
  ) VALUES (
    dep.user_id,
    'deposit',
    dep.amount,
    'Deposit Approved',
    'completed',
    dep.id,
    (balance_before - dep.amount),
    balance_before
  );

  UPDATE public.deposits
  SET
    status = 'approved',
    admin_note = p_admin_note,
    approved_by = auth.uid(),
    approved_at = now()
  WHERE id = dep.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_deposit(
  p_deposit_id uuid,
  p_admin_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dep RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Not authorized to reject deposits.';
  END IF;

  SELECT * INTO dep FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
  IF dep.id IS NULL THEN
    RAISE EXCEPTION 'Deposit not found.';
  END IF;

  IF dep.status <> 'pending' THEN
    RAISE EXCEPTION 'Deposit is not pending.';
  END IF;

  UPDATE public.deposits
  SET
    status = 'rejected',
    admin_note = p_admin_note,
    approved_by = auth.uid(),
    approved_at = now()
  WHERE id = dep.id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_deposit(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_deposit(uuid, text) FROM PUBLIC;

-- Allow authenticated users to execute; RLS/admin checks are inside the functions.
GRANT EXECUTE ON FUNCTION public.approve_deposit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_deposit(uuid, text) TO authenticated;

