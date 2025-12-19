import { supabaseAdmin } from "../utils/supabase.js";
import { inngest } from "../inngest/client.js";

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

export const evaluate = async (type, query, documentQuery, userId, conv) => {
  try {
    // Validate required parameters
    if (!type || !query || !userId) {
      throw new Error(
        "Missing required parameters: type, query, and userId are required",
      );
    }

    // Fetch the active policy for the given type
    if (conv == "0") {
      const policy = await getActivePolicy(type);

      if (!policy) {
        throw new Error(`No active policy found for type: ${type}`);
      }

      // Trigger the Inngest workflow for policy evaluation
      await inngest.send({
        name: "policy/evaluate",
        data: {
          policy,
          query,
          documentQuery: documentQuery || "",
          conv,
          userId,
        },
      });
      return {
        success: true,
        message: "Policy evaluation workflow triggered successfully",
        policyType: policy.policy_type,
        policyVersion: policy.version,
      };
    } else {
      // Handle follow-up conversation
      return {
        success: true,
        message: "Follow-up conversation handler not yet implemented",
        conv,
      };
    }
  } catch (error) {
    console.error("Error in evaluate service:", error);
    throw error;
  }
};
