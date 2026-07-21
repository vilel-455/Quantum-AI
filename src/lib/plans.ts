import { supabase } from './supabase';

export type Plan = {
  id: string;
  title?: string;
  name?: string;
  minimum: number;
  maximum: number | null;
  roi_percent: number;
  duration_days: number;
  description?: string | null;
  active?: boolean;
  created_at?: string | null;
};

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from<Plan>('plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Unable to load investment plans.');
  }

  return data ?? [];
}

export async function getActivePlans(): Promise<Plan[]> {
  const plans = await getPlans();
  return plans.filter((plan) => plan.active !== false);
}

export async function getPlan(id: string): Promise<Plan> {
  const { data, error } = await supabase
    .from<Plan>('plans')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to load plan.');
  }

  if (!data) {
    throw new Error('Plan unavailable.');
  }

  return data;
}
