create extension if not exists pgcrypto;

-- Withdrawals table
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric(20,8) not null check (amount > 0),
  withdrawal_method text not null,
  account_name text,
  account_number text,
  bank_name text,
  wallet_address text,
  network text,
  status text not null default 'pending',
  admin_note text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.withdrawals enable row level security;

-- Ensure updated_at is maintained
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists withdrawals_set_updated_at on public.withdrawals;
create trigger withdrawals_set_updated_at
before update on public.withdrawals
for each row execute function public.set_updated_at();

-- RLS Policies
-- Users: read own withdrawals
drop policy if exists "withdrawals_self_read" on public.withdrawals;
create policy "withdrawals_self_read"
  on public.withdrawals
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users: insert own withdrawals
drop policy if exists "withdrawals_self_insert" on public.withdrawals;
create policy "withdrawals_self_insert"
  on public.withdrawals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admins: view all
drop policy if exists "withdrawals_admin_read" on public.withdrawals;
create policy "withdrawals_admin_read"
  on public.withdrawals
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.account_status = 'active'
        and p.verification_status = 'verified'
    )
  );

-- Admins: approve/reject (update)
-- Note: app calls RPC which updates the row; RLS must allow it.
-- We allow update to admins for rows owned by anyone.
drop policy if exists "withdrawals_admin_update" on public.withdrawals;
create policy "withdrawals_admin_update"
  on public.withdrawals
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.account_status = 'active'
        and p.verification_status = 'verified'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.account_status = 'active'
        and p.verification_status = 'verified'
    )
  );

-- ============
-- RPC: approve_withdrawal
-- Atomic wallet deduction + ledger insert
-- ============

create or replace function public.approve_withdrawal(
  p_withdrawal_id uuid,
  p_admin_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
  v_balance_before numeric(20,8);
  v_balance_after numeric(20,8);
  v_wallet_id uuid;
begin
  -- Admin check
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.account_status = 'active'
      and p.verification_status = 'verified'
  ) then
    raise exception 'Permission denied';
  end if;

  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'pending' then
    raise exception 'Withdrawal is not pending';
  end if;

  select w.id, w.balance into v_wallet_id, v_balance_before
  from public.wallets w
  where w.user_id = v_withdrawal.user_id
  for update;

  if v_balance_before is null then
    raise exception 'Wallet not found';
  end if;

  if v_balance_before < v_withdrawal.amount then
    raise exception 'Insufficient wallet balance';
  end if;

  v_balance_after := v_balance_before - v_withdrawal.amount;

  update public.wallets
  set balance = v_balance_after
  where id = v_wallet_id;

  update public.withdrawals
  set status = 'approved',
      admin_note = p_admin_note,
      approved_by = auth.uid(),
      approved_at = now()
  where id = p_withdrawal_id;

  insert into public.transactions (
    user_id,
    type,
    amount,
    description,
    status,
    reference,
    balance_before,
    balance_after
  ) values (
    v_withdrawal.user_id,
    'withdrawal',
    v_withdrawal.amount,
    'Withdrawal approved',
    'completed',
    v_withdrawal.id,
    v_balance_before,
    v_balance_after
  );

  return;
end;
$$;

revoke all on function public.approve_withdrawal(uuid, text) from public;

create or replace function public.reject_withdrawal(
  p_withdrawal_id uuid,
  p_admin_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.account_status = 'active'
      and p.verification_status = 'verified'
  ) then
    raise exception 'Permission denied';
  end if;

  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'pending' then
    raise exception 'Withdrawal is not pending';
  end if;

  update public.withdrawals
  set status = 'rejected',
      admin_note = p_admin_note,
      approved_by = auth.uid(),
      approved_at = now()
  where id = p_withdrawal_id;

  return;
end;
$$;

revoke all on function public.reject_withdrawal(uuid, text) from public;

