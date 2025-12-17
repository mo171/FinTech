import { supabaseAdmin } from '../config/supabase.js';

export const getActivePolicy = async (type) => {

  const { data, error } = await supabaseAdmin
    .from('policies')
    .select('*')
    .eq('policy_type', type)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};


export const evaluate = async (type, policy, query, documentQuery) => {
  // Placeholder for evaluation logic


  // This function should implement the logic to evaluate the policy

  
  // based on the type, query, and documentQuery provided.
}