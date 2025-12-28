/*
  - THE SECOND MOST CRUCIAL MODULE OF BACKEND
  - COMPLIANCE CHAPT-BOT SERVICES AND BUSSINIESS LOGIC ARE ARE BROUGHT HERE
  - THIS IS THE PLACE WHERE FRONT-END INFO IS RECIVED AND DECONTRUCTED 
*/

//IMPORT
import { evaluate } from "../services/policy.service.js"; // * name is not that correct but initalize chat- retrives data from db
import { askLLM } from "../utils/llmClient.js"; // * for proccesing of json data recived from front-end
import { getConversation } from "../services/databsesaving.service.js"; // * for getting conversation from db
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ExtractionSchema } from "../services/schemaValidation.service.js";

/*  
  - TAKES THE JSON RESPONSE FROM FRONTEND
  - SEND JSON RESPONSE TO BACKEND
  - RESPONSE FORMAT 
    - {
      "type": string * the type shuld be type_policy thats how its stored in db
      "query": string, * user query over that policy
      "conv": string * conversation id if not comes from frontend creates new one 
      }
*/
const getData = async (input) => {
  // Check if input already has structured fields (type, query, conv)
  // If so, skip LLM processing and return directly
  if (typeof input === "object" && input.type !== undefined && input.query) {
    const conv = input.conv || input.convo || "0";
    return {
      type: input.type,
      query: input.query,
      conv: String(conv), // Ensure it's a string
    };
  }
};

/* 
  - THIS CONTROLLERS BRING EVERY MODULE AND ASPECTS TOGETHER
  - PROCESS INFO AND SEND JSON RESPONSE TO FRONT-END
*/
const evaluateRequest = asyncHandler(async (req, res) => {
  try {
    const { type, query, convo, conv } = req.body;
    const activeConvo = convo || conv || "0";
    console.log(activeConvo);

    // TAKES THE CONVO IF NOT 0 AND INTEFIES TYPE  FROM DB
    if (activeConvo !== "0") {
      const conversation = await getConversation(activeConvo);
      if (conversation && conversation.policy_type) {
        type = conversation.policy_type; // * type is again reset from db
      }
    }

    // Basic validation
    if (!type || !query) {
      return res.status(400).json({
        error: "Missing required fields: type and query are required",
      });
    }

    // Delegate to service layer for evaluation logic (handles initial and follow-ups)
    // - HERE IS WHERE ALL THE BUSINESS LOGIC IS DONE
    const result = await evaluate(type, query, req.user.id, activeConvo);

    // RETURNING JSON RESPONSE TO FRONT-END
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
