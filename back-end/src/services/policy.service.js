import { extractTextFromPDF } from "../utils/pdfExtraction.js";
import { askLLM } from "../utils/llmClient.js";
import { DecisionSchema } from "./schemaValidation.service.js";
import {
  getActivePolicy,
  storePolicyText,
  createConversation,
  saveMessage,
  getStoredPolicyText,
  getSaveMessages,
} from "./databsesaving.service.js";

// ----------------------- EVALUATION -------------------------

export const evaluate = async (type, query, documentQuery, userId, conv) => {
  try {
    // Validate required parameters
    if (!type || !query || !userId) {
      throw new Error(
        "Missing required parameters: type, query, and userId are required",
      );
    }

    const policy = await getActivePolicy(type);
    let policyText = await getStoredPolicyText(policy.id);

    if (!policyText) {
      let pdfBuffer;
      try {
        const res = await fetch(policy.pdf_url);
        if (!res.ok) {
          throw new Error(`Failed to fetch PDF: ${res.statusText}`);
        }
        pdfBuffer = Buffer.from(await res.arrayBuffer());
      } catch (error) {
        console.error("Error fetching PDF:", error);
        throw error;
      }
      // EXTRACTS THE PDF TEXT
      policyText = await extractTextFromPDF(pdfBuffer);
      await storePolicyText(policy, policyText);
    }

    let conversation;
    let systemInstruction =
      "You are a bank compliance expert analyzing policy documents.";
    let contextualHistory = "";

    const normalizedConv = typeof conv === "string" ? conv.trim() : conv;

    if (normalizedConv === "0") {
      conversation = await createConversation(userId, policy);
    } else {
      conversation = { id: normalizedConv };
      const messages = await getSaveMessages(conversation.id);

      if (messages && messages.length > 0) {
        // Format history for the LLM
        contextualHistory = messages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");

        systemInstruction +=
          "\nThis is a follow-up session. Use the previous context below to inform your answer.";
      }
    }

    const prompt = `
      STRICT SYSTEM INSTRUCTIONS:
      ${systemInstruction}
      
      CRITICAL RULE: Your response must be based ENTIRELY and EXCLUSIVELY on the "POLICY DOCUMENT TEXT" provided below. 
      - If the answer is not in the text, state that the current policy does not cover this and set status to "ACTION_REQUIRED".
      - DO NOT use your internal general knowledge. Rely ONLY on the provided document.
      - In the "explanation" and "response", you MUST reference or quote specific rules from the policy.

      ${
        contextualHistory
          ? `PREVIOUS CONTEXT (History of this conversation):\n${contextualHistory}\n`
          : ""
      }

      POLICY DOCUMENT TEXT (The ONLY source of truth):
      ${policyText}

      USER QUESTION:
      ${query}

      ${
        documentQuery
          ? `DOCUMENT SEARCH GUIDANCE: Focus specifically on finding information related to: ${documentQuery}`
          : ""
      }

      DETAILED TASK:
      1. Thoroughly scan the "POLICY DOCUMENT TEXT" above.
      2. Determine if the user's question can be answered using ONLY this text.
      3. Draft a response that sounds like a professional bank manager explaining these specific rules to a client. Use the exact terminology from the document.
      4. Populate the "relevant_sections" array with verbatim quotes from the document that support your answer.

      OUTPUT RULES:
      - Return ONLY a valid JSON object.
      - Do NOT wrap in markdown or code blocks.
      - Ensure the JSON is directly parseable by JSON.parse().
      - persona: Professional bank compliance manager. Human, empathetic, yet strictly rule-bound.

      JSON SCHEMA:
      {
        "status": "APPROVED" | "REJECTED" | "ACTION_REQUIRED",
        "explanation": "A detailed technical explanation citing specific policy rules for internal banking records.",
        "relevant_sections": ["list of verbatim quotes from the policy text"],
        "recommendation": "A concise actionable step for the bank staff.",
        "response": "A human-friendly explanation for the customer, sounding like a bank manager, explaining what the policy says about their query.",
        "responseforfurtherllm": "A concise summary of this turn for your own memory to maintain context in future messages."
      }
    `;

    const llmRawResponse = await askLLM(prompt);

    // Parse once to validate and use
    let parsedDecision;
    try {
      parsedDecision = JSON.parse(llmRawResponse);
      // Validate with Zod
      parsedDecision = DecisionSchema.parse(parsedDecision);
    } catch (err) {
      console.error("Parsing/Validation Error:", err, llmRawResponse);
      // Fallback for non-JSON responses or schema mismatches
      parsedDecision = {
        status: "ACTION_REQUIRED",
        explanation: "The assistant response was not in the expected format.",
        relevant_sections: [],
        recommendation: "Please review the response manually.",
        response: llmRawResponse,
        responseforfurtherllm: llmRawResponse,
      };
    }

    // Update conversation history
    await saveMessage({
      conversationId: conversation.id,
      role: "user",
      content: query,
    });

    await saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: parsedDecision.responseforfurtherllm,
    });

    return {
      ...parsedDecision,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error("Error in evaluate service:", error);
    throw error;
  }
};
