import { evaluate } from "../services/policy.service.js";
import { supabaseAdmin } from "../utils/supabase.js";

/**
 * Controller to handle policy evaluation requests
 * Delegates business logic to the service layer
 */
const evaluateRequest = async (req, res) => {
  try {
    const { type, query, documentQuery } = req.body;

    // Validate required fields
    if (!type || !query) {
      return res.status(400).json({
        error: "Missing required fields: type and query are required",
      });
    }

    // Delegate to service layer for evaluation logic
    const result = await evaluate(type, query, documentQuery, req.user.id);

    return res.status(200).json({
      message: "Policy evaluation in progress",
      ...result,
    });
  } catch (error) {
    console.error("Error in evaluateRequest controller:", error);
    return res.status(500).json({
      error: error.message || "Failed to initiate policy evaluation",
    });
  }
};

/**
 * Controller to retrieve the latest evaluation result for the authenticated user
 */
export const getLatestEvaluation = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("evaluations")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching latest evaluation:", error);
      return res.status(404).json({
        error: "No evaluation results found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getLatestEvaluation controller:", error);
    return res.status(500).json({
      error: "Failed to retrieve evaluation results",
    });
  }
};

export { evaluateRequest };
