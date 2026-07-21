-- Admin schema + RLS (template)
-- IMPORTANT:
-- 1) This project currently uses a `profiles` table from AuthPage.
-- 2) The admin UI expects `profiles.role = 'admin'`.
-- 3) Run this SQL in Supabase SQL editor.

-- =============
-- 1) profiles: ensure auth/profile status columns
-- =============
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN account_status text NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN verification_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'user'))
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_check
      CHECK (account_status IN ('active', 'inactive', 'suspended'))
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_verification_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('verified', 'pending', 'rejected'))
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles
    GROUP BY id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate profiles.id values exist. Remove duplicate profile rows before adding auth/profile constraints.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_auth_users_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- =============
-- 2) Optional admin-managed settings table
-- =============
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL,
  logo_url text,
  support_email text NOT NULL,
  withdrawal_fee numeric(20,8) NOT NULL DEFAULT 0,
  minimum_deposit numeric(20,8) NOT NULL DEFAULT 0,
  minimum_withdrawal numeric(20,8) NOT NULL DEFAULT 0,
  referral_bonus_percent numeric(20,8) NOT NULL DEFAULT 0,
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure single-row semantics (optional). Admin can enforce in UI.
CREATE INDEX IF NOT EXISTS platform_settings_updated_at_idx
  ON public.platform_settings(updated_at DESC);

-- =============
-- 3) Ensure newsletter subscribers table
-- =============
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
  ON public.newsletter_subscribers(created_at DESC);

-- =============
-- 4) Investment plans table
-- =============
CREATE TABLE IF NOT EXISTS public.investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  minimum numeric(20,8) NOT NULL,
  maximum numeric(20,8) NOT NULL,
  roi_percent numeric(20,8) NOT NULL,
  duration text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#E53E3E',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investment_plans_featured_idx
  ON public.investment_plans(featured);

-- =============
-- 5) User wallets
-- =============
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(20,8) NOT NULL DEFAULT 0,
  profit_balance numeric(20,8) NOT NULL DEFAULT 0,
  bonus_balance numeric(20,8) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_unique_idx
  ON public.wallets(user_id);

-- =============
-- 6) User investments
-- =============
CREATE TABLE IF NOT EXISTS public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.investment_plans(id) ON DELETE SET NULL,
  amount numeric(20,8) NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investments_user_id_idx ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS investments_status_idx ON public.investments(status);

-- =============
-- 7) Support tickets
-- =============
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'Open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_status_idx
  ON public.support_tickets(status);

CREATE INDEX IF NOT EXISTS support_ticket_replies_ticket_id_idx
  ON public.support_ticket_replies(ticket_id);

-- =============
-- 8) Deposits & Withdrawals (admin approve/reject)
-- =============
-- These tables may already exist in your project; we create them only if missing.
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(20,8) NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  proof_url text,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(20,8) NOT NULL,
  wallet_address text NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deposits_status_idx ON public.deposits(status);
CREATE INDEX IF NOT EXISTS withdrawals_status_idx ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON public.withdrawals(user_id);

-- =============
-- 9) Master transaction ledger (single table)
-- =============
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL, -- 'deposit','withdrawal','profit','investment','referral_bonus'
  amount numeric(20,8) NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);

-- =============
-- 10) Auth user bootstrap + existing-user backfill
-- =============
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    phone,
    country,
    referral_code,
    wallet_balance,
    profit_balance,
    bonus_balance,
    kyc_status,
    investment_plan,
    role,
    account_status,
    verification_status
  )
  VALUES (
    NEW.id,
    lower(coalesce(NEW.email, '')),
    coalesce(
      nullif(NEW.raw_user_meta_data->>'username', ''),
      split_part(coalesce(NEW.email, 'user'), '@', 1) || '-' || left(NEW.id::text, 8)
    ),
    coalesce(NEW.raw_user_meta_data->>'full_name', ''),
    coalesce(NEW.raw_user_meta_data->>'phone', ''),
    coalesce(NEW.raw_user_meta_data->>'country', ''),
    nullif(NEW.raw_user_meta_data->>'referral', ''),
    0,
    0,
    0,
    'Pending',
    null,
    'user',
    'active',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (
    user_id,
    balance,
    profit_balance,
    bonus_balance
  )
  VALUES (
    NEW.id,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_auth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_auth_user() FROM anon;
REVOKE ALL ON FUNCTION private.handle_new_auth_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  phone,
  country,
  referral_code,
  wallet_balance,
  profit_balance,
  bonus_balance,
  kyc_status,
  investment_plan,
  role,
  account_status,
  verification_status
)
SELECT
  u.id,
  lower(coalesce(u.email, '')),
  coalesce(
    nullif(u.raw_user_meta_data->>'username', ''),
    split_part(coalesce(u.email, 'user'), '@', 1) || '-' || left(u.id::text, 8)
  ),
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce(u.raw_user_meta_data->>'phone', ''),
  coalesce(u.raw_user_meta_data->>'country', ''),
  nullif(u.raw_user_meta_data->>'referral', ''),
  0,
  0,
  0,
  'Pending',
  null,
  'user',
  'active',
  'pending'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

INSERT INTO public.wallets (
  user_id,
  balance,
  profit_balance,
  bonus_balance
)
SELECT
  u.id,
  0,
  0,
  0
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
WHERE w.user_id IS NULL;

-- =============
-- 11) RLS enable + policies
-- =============
-- Helper: auth roles are stored in profiles.role.

-- profiles (RLS) - allow admin to update only their own? (UI will be admin editing users)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile.
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- Users can create their own profile after Supabase Auth signup.
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id AND role = 'user');

-- Admin can read profiles
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- Admin can update profiles
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_self_read" ON public.wallets;
CREATE POLICY "wallets_self_read" ON public.wallets
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "wallets_self_insert" ON public.wallets;
CREATE POLICY "wallets_self_insert" ON public.wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND balance = 0
    AND profit_balance = 0
    AND bonus_balance = 0
  );

DROP POLICY IF EXISTS "wallets_admin_all" ON public.wallets;
CREATE POLICY "wallets_admin_all" ON public.wallets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deposits_self_read" ON public.deposits;
CREATE POLICY "deposits_self_read" ON public.deposits
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "deposits_self_insert" ON public.deposits;
CREATE POLICY "deposits_self_insert" ON public.deposits
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "deposits_admin_read" ON public.deposits;
CREATE POLICY "deposits_admin_read" ON public.deposits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);
DROP POLICY IF EXISTS "deposits_admin_update" ON public.deposits;
CREATE POLICY "deposits_admin_update" ON public.deposits FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawals_self_read" ON public.withdrawals;
CREATE POLICY "withdrawals_self_read" ON public.withdrawals
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "withdrawals_self_insert" ON public.withdrawals;
CREATE POLICY "withdrawals_self_insert" ON public.withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "withdrawals_admin_read" ON public.withdrawals;
CREATE POLICY "withdrawals_admin_read" ON public.withdrawals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);
DROP POLICY IF EXISTS "withdrawals_admin_update" ON public.withdrawals;
CREATE POLICY "withdrawals_admin_update" ON public.withdrawals FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_self_read" ON public.transactions;
CREATE POLICY "transactions_self_read" ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_admin_read" ON public.transactions;
CREATE POLICY "transactions_admin_read" ON public.transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- investment_plans
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investment_plans_authenticated_read" ON public.investment_plans;
CREATE POLICY "investment_plans_authenticated_read" ON public.investment_plans
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "investment_plans_admin_all" ON public.investment_plans;
CREATE POLICY "investment_plans_admin_all" ON public.investment_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investments_self_read" ON public.investments;
CREATE POLICY "investments_self_read" ON public.investments
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investments_self_insert" ON public.investments;
CREATE POLICY "investments_self_insert" ON public.investments
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "investments_admin_all" ON public.investments;
CREATE POLICY "investments_admin_all" ON public.investments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
        AND p.account_status = 'active'
        AND p.verification_status = 'verified'
    )
  );

-- support_tickets + replies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_tickets_admin_all" ON public.support_tickets;
CREATE POLICY "support_tickets_admin_all" ON public.support_tickets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

DROP POLICY IF EXISTS "support_ticket_replies_admin_all" ON public.support_ticket_replies;
CREATE POLICY "support_ticket_replies_admin_all" ON public.support_ticket_replies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "newsletter_subscribers_admin_all" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_admin_all" ON public.newsletter_subscribers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_settings_admin_all" ON public.platform_settings;
CREATE POLICY "platform_settings_admin_all" ON public.platform_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
      AND p.account_status = 'active'
      AND p.verification_status = 'verified'
  )
);

-- =============
-- NOTE ABOUT BALANCE UPDATES (Approve/Reject)
-- =============
-- The UI will call client-side mutations to update deposit/withdrawal status.
-- For correctness and safety, implement DB triggers/functions that:
--  - On deposit approve: add amount to profiles.wallet_balance
--  - On withdrawal approve: subtract amount from profiles.wallet_balance
--  - On withdrawal reject: refund (if deducted earlier)
--  - On deposit reject/withdrawal reject: store reject_reason
--
-- This file includes structure + RLS, but not those balance-moving functions yet.

