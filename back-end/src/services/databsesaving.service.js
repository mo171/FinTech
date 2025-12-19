import { supabaseAdmin } from "../utils/supabase.js";

export const createConversation = async (userId, policy) => {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: userId,
      policy_id: policy.id,
      policy_type: policy.policy_type,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveMessage = async ({ conversationId, role, content }) => {
  const { error } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) throw error;
};

export const getStoredPolicyText = async (policyId) => {
  const { data, error } = await supabaseAdmin
    .from("policy_documents_text")
    .select("raw_text")
    .eq("policy_id", policyId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw error;
  }

  return data?.raw_text || null;
};

export const storePolicyText = async (policy, rawText) => {
  const { error } = await supabaseAdmin.from("policy_documents_text").insert({
    policy_id: policy.id,
    source_url: policy.pdf_url,
    raw_text: rawText,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
};

export const getActivePolicy = async (type) => {
  const { data, error } = await supabaseAdmin
    .from("policies")
    .select("*")
    .eq("policy_type", type)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const getSaveMessages = async (conversationId) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("content, role")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true }); // Ascending for easier history processing

  if (error) throw error;
  return data;
};
