/*
 * DATABASE SAVING SERVICE
 * Responsible for all direct interactions with Supabase tables related to chat and policies.
 * Handles:
 * - Conversation creation and retrieval
 * - Message persistence (Role-based: user/assistant)
 * - Policy text and status lookups
 */
import { supabaseAdmin } from "../utils/supabase.js";

/**
 * createConversation
 * Initializes a new chat session for a user.
 * Links the conversation to a specific policy if identified.
 */
export const createConversation = async (userId, policy) => {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      user_id: userId,
      policy_id: policy ? policy.id : null,
      policy_type: policy ? policy.policy_type : null,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * getConversation
 * Fetches conversation details by ID.
 */
export const getConversation = async (conversationId) => {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * saveMessage
 * Records an individual chat message (User or AI) in the DB.
 */
export const saveMessage = async ({ conversationId, role, content }) => {
  const { error } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) throw error;
};

/**
 * getStoredPolicyText
 * Retrieves the raw text content of a policy document from chunks (used for indexing check).
 */
export const getStoredPolicyText = async (policyId) => {
  const { data, error } = await supabaseAdmin
    .from("policy_chunks")
    .select("content")
    .eq("policy_id", policyId)
    .limit(1);

  if (error) throw error;

  return data.length > 0 ? data[0].content : null;
};

/**
 * storePolicyText
 * (Legacy/Utility) Stores raw text for a policy document.
 */
export const storePolicyText = async (policy, rawText) => {
  const { error } = await supabaseAdmin.from("policy_documents_text").insert({
    policy_id: policy.id,
    source_url: policy.pdf_url,
    raw_text: rawText,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
};

/**
 * getActivePolicy
 * Finds the latest version of a specific policy type.
 */
export const getActivePolicy = async (type) => {
  const { data, error } = await supabaseAdmin
    .from("policies")
    .select("*")
    .eq("policy_type", type)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(
        `No active policy found for type: "${type}". Please ensure this policy type exists in the database.`,
      );
    }
    throw error;
  }
  return data;
};

/**
 * getSaveMessages
 * Retrieves the message history for a conversation to provide context to the LLM.
 */
export const getSaveMessages = async (conversationId) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("content, role")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true }); // Ascending for easier history processing

  if (error) throw error;
  return data;
};
