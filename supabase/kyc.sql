create extension if not exists pgcrypto;

create table if not exists public.kyc_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  document_url text,
  selfie_url text,
  address_url text,
  status text not null default 'pending',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint kyc_requests_unique_user_document unique (user_id, document_type)
);

alter table public.kyc_requests enable row level security;

create policy if not exists "Users can view their own KYC requests" on public.kyc_requests
  for select using (auth.uid() = user_id);

create policy if not exists "Users can insert their own KYC requests" on public.kyc_requests
  for insert with check (auth.uid() = user_id);

create policy if not exists "Users can update their own KYC requests" on public.kyc_requests
  for update using (auth.uid() = user_id);

create policy if not exists "Admins can view all KYC requests" on public.kyc_requests
  for select using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.account_status = 'active' and p.verification_status = 'verified'
    )
  );

create policy if not exists "Admins can update all KYC requests" on public.kyc_requests
  for update using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.account_status = 'active' and p.verification_status = 'verified'
    )
  );

create policy if not exists "Admins can insert KYC requests" on public.kyc_requests
  for insert with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.account_status = 'active' and p.verification_status = 'verified'
    )
  );

create policy if not exists "Users can access their own KYC documents" on storage.objects
  for select using (
    bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload their own KYC documents" on storage.objects
  for insert with check (
    bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own KYC documents" on storage.objects
  for update using (
    bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Admins can access all KYC documents" on storage.objects
  for select using (
    bucket_id = 'kyc-documents' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.account_status = 'active' and p.verification_status = 'verified'
    )
  );
