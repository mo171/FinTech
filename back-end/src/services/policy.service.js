/*
  - THE MOST IMPORTANT MODULE OF THE BACKEND
  - CORE BUSINESS LOGIC GOES HERE
  - INNGEST WORKFLOW IF NEEDED IS TRIGGERED HERE
  - RAG OPERATION FOR RETRIVAL IS DONE HERE
  - LLM PROCESSING IS DONE HERE
  - DATABASE OPERATIONS ARE DONE HERE

*/
import { askLLM } from "../utils/llmClient.js";
import { inngest } from "../inngest/client.js";
import { DecisionSchema } from "./schemaValidation.service.js";
import { retrieveRelevantChunks, formatChunks } from "./chunks.service.js";
import {
  getActivePolicy,
  createConversation,
  saveMessage,
  getStoredPolicyText,
  getSaveMessages,
} from "./databsesaving.service.js";

// ----------------------- EVALUATION -------------------------

export const evaluate = async (type, query, userId, conv) => {
  try {
    // Validate required parameters
    if (!type || !query || !userId) {
      throw new Error(
        "Missing required parameters: type, query, and userId are required",
      );
    }

    /*  
       - GET ACTIVE POLICY IS FROM DB IS RETRIVED HERE
       - THAT POLICY ID IS RECIVED AND CHECKS FOR EXSISTING CHUNKS OF THAT POLICY IN DB
       - IF CHUNKS NOT CREATED THEN IS CREATED BY AUTO TRIGGERING INNGEST WORKFLOW 
       - VECTOR EMBEDDING AND CHUNKS ARE STORED IN DB
    */
    const policy = await getActivePolicy(type);
    let policyText = await getStoredPolicyText(policy.id);

    if (!policyText) {
      try {
        // * Trigger inngest workflow to index this policy
        await inngest.send({
          name: "policy/evaluate",
          data: { policy, query, userId, conv },
        });

        // Wait a bit or return immediate response?
        // For now, we wait for a few seconds to let it process initial chunks
        // or just advise user to wait.
        // Better: throw a specific error or return status.
      } catch (error) {
        console.error("Error triggering Inngest indexing:", error);
        throw error;
      }
    }

    // Retrieve relevant chunks via semantic search
    // uses rag approch to find relevent chunks for answering
    const policyChunks = await retrieveRelevantChunks(policy.id, query);
    console.log(`📊 Retrieved ${policyChunks?.length || 0} chunks total`);

    const relevantContext = formatChunks(policyChunks);
    console.log(
      `📝 Formatted context length: ${relevantContext?.length || 0} characters`,
    );
    console.log(`📝 Context preview: ${relevantContext?.substring(0, 200)}...`);

    if (!relevantContext || relevantContext.trim().length === 0) {
      console.warn("⚠️ No relevant chunks found for the query.");
    }

    // * proccess of initilising / storing messages
    // * message are stored to db bcz llm are state less therfore for understanding what happend in previous convo its nessecary
    let conversation;
    let systemInstruction =
      "You are a bank compliance expert analyzing policy documents.";
    let contextualHistory = "";

    const normalizedConv = typeof conv === "string" ? conv.trim() : conv; // convo is in the form of big-uuid therefore cleaning it

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
      SYSTEM INSTRUCTIONS:
      ${systemInstruction}
      
      IMPORTANT RULES:
      - Base your response on the "RELEVANT POLICY SNIPPETS" provided below.
      - If the user asks about what's IN the document (e.g., "is there lorem text?", "does it mention X?"), answer directly based on what you see in the snippets.
      - For policy compliance questions, provide professional guidance based on the policy content.
      - If the snippets don't contain enough information to answer a policy question, state that clearly and set status to "ACTION_REQUIRED".
      - Quote specific sections from the snippets to support your answer.

      ${
        contextualHistory
          ? `PREVIOUS CONTEXT (History of this conversation):\\n${contextualHistory}\\n`
          : ""
      }

      RELEVANT POLICY SNIPPETS:
      ${relevantContext || "No specific policy sections found for this query."}

      USER QUESTION:
      ${query}

      TASK:
      1. Read the policy snippets above carefully.
      2. If the user is asking about document content (e.g., "is there X in the document?"), answer YES or NO based on what you see.
      3. If the user is asking a policy compliance question, provide professional guidance based on the policy.
      4. Include relevant quotes from the snippets in the "relevant_sections" array.
      5. Be helpful and direct in your response.

      OUTPUT RULES:
      - Return ONLY a valid JSON object.
      - Do NOT wrap in markdown or code blocks.
      - Ensure the JSON is directly parseable by JSON.parse().

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
      //* zod is used for schema validation which takes in broken llm json response and fix it
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
