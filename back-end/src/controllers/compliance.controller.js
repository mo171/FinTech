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

// Fuzzy matching for policy types to handle misspellings and variations
const POLICY_TYPES = [
  {
    key: "privacy_policy",
    aliases: ["privacy", "privasy", "privicy", "data protection", "gdpr"],
  },
  {
    key: "kyc_policy",
    aliases: ["kyc", "know your customer", "customer verification", "identity"],
  },
  {
    key: "aml_policy",
    aliases: ["aml", "anti money laundering", "money laundering", "anti-money"],
  },
  { key: "fraud_policy", aliases: ["fraud", "fraud prevention", "anti-fraud"] },
  {
    key: "compliance_policy",
    aliases: ["compliance", "regulatory", "regulation"],
  },
];

const fuzzyMatchPolicyType = (input) => {
  if (!input) return null;

  const normalized = input.toLowerCase().trim().replace(/[_-]/g, " ");

  // Exact match first
  for (const policy of POLICY_TYPES) {
    if (policy.key === input || policy.key.replace("_", " ") === normalized) {
      return policy.key;
    }
  }

  // Check aliases
  for (const policy of POLICY_TYPES) {
    for (const alias of policy.aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return policy.key;
      }
    }
  }

  return null;
};

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

  // Otherwise, use LLM to extract fields from natural language input
  /* 
     front end has to send json response in the format
     { 
       "message": string (what user wrote in input field)
       "convo": convId(recived from backend) || "0"
      }
  */
  const message =
    typeof input === "string"
      ? input
      : input.message || input.content || input.query;
  const convo =
    typeof input === "string" ? "0" : input.convo || input.conv || "0";

  if (!message) {
    throw new Error("No message or query provided");
  }

  // FIRST: Try fuzzy matching directly on the message
  // This is faster and more reliable for common queries
  const fuzzyMatchedType = fuzzyMatchPolicyType(message);

  if (fuzzyMatchedType) {
    console.log(`✅ Fuzzy match found: "${message}" → ${fuzzyMatchedType}`);
    return {
      type: fuzzyMatchedType,
      query: message,
      conv: String(convo),
    };
  }

  // SECOND: If fuzzy matching fails, use LLM for more complex extraction
  console.log(`🤖 Using LLM for extraction: "${message}"`);

  const rawInput = JSON.stringify({ message });

  const prompt = `
    Extract structured information from the following user request for a bank compliance system.
    
    USER REQUEST:
    "${rawInput}"
    
    CRITICAL INSTRUCTIONS:
    1. Identify the POLICY TYPE from the user's message. Look for keywords related to:
       - "privacy" or "data protection" → type: "privacy_policy"
       - "kyc" or "know your customer" or "identity verification" → type: "kyc_policy"
       - "aml" or "anti money laundering" → type: "aml_policy"
       - "fraud" or "fraud prevention" → type: "fraud_policy"
       - "compliance" or "regulatory" → type: "compliance_policy"
    
    2. Extract the user's QUERY (their actual question or request).
    
    3. The 'conv' value is: "${convo}"
    
    EXAMPLES:
    - "tell me about privacy policy" → {"type": "privacy_policy", "query": "tell me about privacy policy", "conv": "${convo}"}
    - "what are the KYC requirements?" → {"type": "kyc_policy", "query": "what are the KYC requirements?", "conv": "${convo}"}
    - "data retention period" → {"type": "privacy_policy", "query": "data retention period", "conv": "${convo}"}
    - "how to verify customer identity" → {"type": "kyc_policy", "query": "how to verify customer identity", "conv": "${convo}"}
    
    IMPORTANT:
    - If you detect a policy type keyword, ALWAYS set the type field
    - Use the EXACT format: "privacy_policy", "kyc_policy", "aml_policy", etc.
    - If no policy type is mentioned and conv is not "0", set type to null
    - Keep the query as the user's original message
    
    RETURN ONLY VALID JSON (no markdown, no code blocks):
    {
      "type": string | null,
      "query": string,
      "conv": string
    }
  `;

  try {
    const llmResponse = await askLLM(prompt);
    const parsed = JSON.parse(llmResponse.replace(/```json|```/g, "").trim());

    console.log(`🤖 LLM extracted:`, parsed);

    // Apply fuzzy matching to the extracted type
    if (parsed.type) {
      const matchedType = fuzzyMatchPolicyType(parsed.type);
      if (matchedType) {
        parsed.type = matchedType;
        console.log(`✅ LLM type validated: ${matchedType}`);
      }
    }

    // Validate with Zod
    return ExtractionSchema.parse(parsed);
  } catch (error) {
    console.error("❌ Error parsing user input with LLM or Zod:", error);

    // Final fallback: return with null type
    return {
      type: null,
      query: message || "",
      conv: String(convo),
    };
  }
};

/* 
  - THIS CONTROLLERS BRING EVERY MODULE AND ASPECTS TOGETHER
  - PROCESS INFO AND SEND JSON RESPONSE TO FRONT-END
*/
const evaluateRequest = asyncHandler(async (req, res) => {
  try {
    const { content, message, convo, conv } = req.body;
    const Data = await getData(req.body);
    const activeConvo = convo || conv || "0";
    let { type, query } = Data;

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
