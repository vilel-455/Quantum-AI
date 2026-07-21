import { supabase } from '../../../lib/supabase';

// Admin check strategy: read the authenticated user's profile role.
export async function fetchIsAdmin(): Promise<boolean> {
  const { data: userRes, error: userError } = await supabase.auth.getUser();
  const user = userRes.user;
  if (userError || !user?.id) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('role, account_status, verification_status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return false;
  return (
    (data as any)?.role === 'admin' &&
    (data as any)?.account_status === 'active' &&
    (data as any)?.verification_status === 'verified'
  );
}

