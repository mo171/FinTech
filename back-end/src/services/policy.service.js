/*
  - THE MOST IMPORTANT MODULE OF THE BACKEND
  - CORE BUSINESS LOGIC GOES HERE
  - INNGEST WORKFLOW IF NEEDED IS TRIGGERED HERE
  - RAG OPERATION FOR RETRIVAL IS DONE HERE
  - LLM PROCESSING IS DONE HERE
  - DATABASE OPERATIONS ARE DONE HERE

*/
import { askLLM } from "../utils/llmClient.js";
import { DecisionSchema } from "./schemaValidation.service.js";
import { retrieveRelevantChunks, formatChunks } from "./chunks.service.js";
import {
  createConversation,
  saveMessage,
  getSaveMessages,
} from "./databsesaving.service.js";

// ----------------------- EVALUATION -------------------------

export const evaluate = async (query, userId, conv) => {
  try {
    // Validate required parameters
    if (!query || !userId) {
      throw new Error(
        "Missing required parameters: query and userId are required",
      );
    }

    // Retrieve relevant chunks via global semantic search
    // This now searches across all policies in the database
    const policyChunks = await retrieveRelevantChunks(query);
    console.log(`📊 Retrival: Found ${policyChunks?.length || 0} chunks total`);

    const relevantContext = formatChunks(policyChunks);
    console.log(
      `📝 Context: Formatted length ${relevantContext?.length || 0} characters`,
    );

    // * process of initialising / storing messages
    let conversation;
    let systemInstruction =
      "You are a bank compliance expert analyzing policy documents.";
    let contextualHistory = "";
    let detectedPolicyId = null;

    const normalizedConv = typeof conv === "string" ? conv.trim() : conv;

    if (normalizedConv === "0") {
      // FOR NEW CONVERSATIONS:
      // Identify the most relevant policy from the search results
      if (policyChunks && policyChunks.length > 0) {
        detectedPolicyId = policyChunks[0].policy_id;
        console.log(
          `🎯 Auto-Detection: Identified policy ID ${detectedPolicyId}`,
        );
      } else {
        console.warn("⚠️ No relevant policy identified from query.");
        // Fallback or handle case where no chunks are found
        // We'll create a conversation with a null policy or a default one if necessary,
        // llm will send the dedicated response if it happens
      }

      // Create a conversation. If detectedPolicyId is null, we might need to handle this.
      // Assuming createConversation can handle a null policy.
      // If we don't have a policy, we might want to still create a conversation
      // to track the history.
      const policyStub = detectedPolicyId ? { id: detectedPolicyId } : null;
      conversation = await createConversation(userId, policyStub);
    } else {
      // FOR EXISTING CONVERSATIONS:
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
    /*
     - THE PROMPT NEEDS TO BE UPDATED BASED ON THE NEW REQUIREMENTS
     - LIKE IF THE USER ASKED ABOUT THE POLICY THAT HAS THIS TEXT OR DEALS WITH THIS THEN 
     - THEN RETURN RESPONSE IF RELEVENT CHUNKS ARE NOT RETRIVED THEN 
     - ALSO USING A LOT OF CONTEXTUAL HISTORIES I WANT HI TO LIVE IN THE CONVERSATION

    */
    const prompt = `
      SYSTEM INSTRUCTIONS:
      ${systemInstruction}
      
      IMPORTANT RULES:
      - Base your response on the "RELEVANT POLICY SNIPPETS" provided below.
      - These snippets are retrieved from our database across various bank policies.
      - If the user asks about what's IN the document (e.g., "is there lorem text?", "does it mention X?"), answer directly based on what you see in the snippets.
      - For policy compliance questions, provide professional guidance based on the snippets.
      - If multiple policies are mentioned in snippets, integrate the information if relevant.
      - Quote specific sections from the snippets to support your answer.
      - IF NO RELEVANT SNIPPETS ARE PROVIDED: Explicitly state that no relevant information was found in our database for this query. Do not attempt to guess or use outside knowledge.

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
      3. If no snippets are present, respond stating "No similar policy or relevant information found in our database for this query."
      4. Include relevant quotes from the snippets in the "relevant_sections" array (leave empty if no snippets).
      5. Be helpful and direct in your response, sounding like a professional bank compliance manager.

      OUTPUT RULES:
      - Return ONLY a valid JSON object.
      - Do NOT wrap in markdown or code blocks.
      - Ensure the JSON is directly parseable by JSON.parse().

      JSON SCHEMA:
      {
        "relevant_sections": ["list of verbatim quotes from the policy text"],
        "response": "A human-friendly explanation for the customer, explaining what the policy says about their query.",
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
