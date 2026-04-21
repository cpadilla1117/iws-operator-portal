import { supabase } from './supabase.js';

export async function loadUserRole(email) {
  const { data } = await supabase.from('user_roles').select('role').ilike('email', email).single();
  return data?.role || 'operator';
}

export async function loadPricing() {
  const { data } = await supabase.from('pricing_tiers').select('*').order('sort_order');
  if (!data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id,
    tier1Price: row.tier1_price,
    tier2Price: row.tier2_price,
    tier3Price: row.tier3_price,
    notes: row.notes || '',
    periodStart: row.period_start || '',
    periodEnd: row.period_end || '',
    updatedAt: row.updated_at,
  };
}

export async function savePricing(pricing) {
  if (!pricing) return;
  await supabase.from('pricing_tiers').delete().neq('id', 0);
  const { error } = await supabase.from('pricing_tiers').insert({
    id: pricing.id || Date.now(),
    tier1_price: pricing.tier1Price,
    tier2_price: pricing.tier2Price,
    tier3_price: pricing.tier3Price,
    notes: pricing.notes || '',
    period_start: pricing.periodStart || null,
    period_end: pricing.periodEnd || null,
    sort_order: 0,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('savePricing error:', error);
}
