/*
 * COMPLIANCE CONTROLLER
 * This is the primary entry point for all compliance-related chat interactions.
 * It handles:
 * - Receiving natural language queries from the frontend.
 * - Authenticating the request (via middleware).
 * - Delegating business logic to the policy service.
 * - Returning structured JSON responses to the frontend.
 */

// - IMPORTS
import { evaluate } from "../services/policy.service.js";
import { getConversation } from "../services/databsesaving.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * getData (Utility)
 * Historically used to structure incoming data.
 * Note: Currently logic is mostly handled directly in the controller or service.
 */
const getData = async (input) => {
  if (typeof input === "object" && input.type !== undefined && input.query) {
    const conv = input.conv || input.convo || "0";
    return {
      type: input.type,
      query: input.query,
      conv: String(conv),
    };
  }
};

/**
 * evaluateRequest
 * CORE CONTROLLER FUNCTION
 * 1. Extracts query and convo ID from request body.
 * 2. Validates basic requirements.
 * 3. Triggers the semantic search and LLM logic via evaluate service.
 * 4. Sends the final recommendation and response back to the client.
 */
const evaluateRequest = asyncHandler(async (req, res) => {
  try {
    const { query, convo } = req.body;
    const userId = req.user.id; // Populated by requireAuth middleware
    const activeConvo = convo || "0";

    // - BASIC VALIDATION
    if (!query) {
      return res.status(400).json({
        error: "Missing required field: query is required",
      });
    }

    // - BUSINESS LOGIC DELEGATION
    // The service now handles auto-detection of policies based on user query
    const result = await evaluate(query, userId, activeConvo);

    // - SUCCESS RESPONSE
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Policy evaluation completed successfully",
        ),
      );
  } catch (error) {
    console.error("Error in evaluateRequest controller:", error);
    return res.status(500).json({
      error: error.message || "Failed to initiate policy evaluation",
    });
  }
});

export { evaluateRequest };
