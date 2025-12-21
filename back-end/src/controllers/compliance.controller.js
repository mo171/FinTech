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
  // use LLM to extract fields from (potentially) unstructured input
  /* 
     front end has to send json response in the format
     { 
       "message": string (what user wrote in input field)
       "convo": convId(recived from backend) || "0"
      }
  */
  const message = typeof input === "string" ? input : input.message;
  const rawInput = JSON.stringify({ message });

  const prompt = `
    Extract structured information from the following user request for a bank compliance system.
    
    USER REQUEST:
    "${rawInput}" 
    - the user has requested in raw natural language understand that language and then extract most imp data from it 
     that is type it will be further used as policy type to search in db
    
    INSTRUCTIONS:
    1. Identify the 'type' (e.g., KYC, AML, PRIVACY) if explicitly mentioned.
    2. Identify the 'query' (the main question or message).
    3. Identify 'conv' (the conversation ID provided in the request).
    
    If you cannot find a 'type' but 'conv' is provided, leave 'type' as null.
    If 'type' is present (e.g., "privacy policies"), convert it to a lowercase underscore format (e.g., "privacy_policy").
    
    RETURN ONLY VALID JSON:
    {
      "type": string | null,
      "query": string,
      "conv": string
    }
  `;

  try {
    const llmResponse = await askLLM(prompt);
    const parsed = JSON.parse(llmResponse.replace(/```json|```/g, "").trim());

    // Validate with Zod
    return ExtractionSchema.parse(parsed);
  } catch (error) {
    console.error("Error parsing user input with LLM or Zod:", error);
    // Fallback
    return {
      type: null,
      query: message || "",
      conv: convo,
    };
  }
};

/* 
  - THIS CONTROLLERS BRING EVERY MODULE AND ASPECTS TOGETHER
  - PROCESS INFO AND SEND JSON RESPONSE TO FRONT-END
*/
const evaluateRequest = asyncHandler(async (req, res) => {
  try {
    const Data = await getData(req.body);
    const conv = req.body.convo;
    let { type, query } = Data;

    // TAKES THE CONVO IF NOT 0 AND INTEFIES TYPE  FROM DB
    if (conv !== "0") {
      const conversation = await getConversation(conv);
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
    const result = await evaluate(type, query, req.user.id, conv);

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
