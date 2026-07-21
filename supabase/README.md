# Supabase Admin Dashboard SQL

This folder contains SQL needed to enable the Admin Dashboard backend.

## admin-schema.sql

Creates/updates tables required by the admin UI (admin-only) and enables Row Level Security (RLS) with policies.

### Assumptions

- `profiles` table already exists (used by the current Auth flow).
- Admin access is controlled by `profiles.role = 'admin'` plus active/verified status fields.
- Every `auth.users.id` must have exactly one matching `profiles.id`.
- Every authenticated user must have one `wallets.user_id` row.

### How to run

1. Open Supabase SQL Editor
2. Run `supabase/admin-schema.sql`

### Balances / Approvals

Approve/Reject actions for deposits/withdrawals must update wallet balances and ledger correctly.
For safety, implement this via DB triggers/functions (next step after wiring UI actions).
