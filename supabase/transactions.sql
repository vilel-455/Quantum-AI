create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  amount numeric not null,
  description text,
  status text default 'completed',
  reference uuid,
  balance_before numeric,
  balance_after numeric,
  created_at timestamptz default now(),
  constraint transactions_type_check check (
    type in (
      'deposit',
      'withdrawal',
      'investment',
      'profit',
      'referral_bonus',
      'admin_adjustment'
    )
  ),
  constraint transactions_status_check check (
    status in ('pending', 'completed', 'failed')
  )
);


alter table public.transactions enable row level security;

create policy if not exists "Users can view own transactions"
  on public.transactions
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert own transactions"
  on public.transactions
  for insert
  with check (auth.uid() = user_id);
