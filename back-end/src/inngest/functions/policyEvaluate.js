import { inngest } from "../client.js";
import { extractTextFromPDF } from "../../utils/pdfExtraction.js";
import { askLLM } from "../../utils/llmClient.js";
import { supabaseAdmin } from "../../utils/supabase.js";
// import {
//   chunkText,
//   storePolicyChunks,
//   formatChunks,
//   retrieveRelevantChunks,
// } from "../../services/chunks.service.js";

export const policyEvaluate = inngest.createFunction(
  { name: "Policy Evaluation Workflow" },
  { event: "policy/evaluate" },

  async ({ event, step }) => {
    const { policy, query, documentQuery, conv } = event.data;

    if (conv == "0") {
      // STEP 1: Fetch PDF
      const pdfBuffer = await step.run("fetch-pdf", async () => {
        try {
          const res = await fetch(policy.pdf_url);
          if (!res.ok) {
            throw new Error(`Failed to fetch PDF: ${res.statusText}`);
          }
          return Buffer.from(await res.arrayBuffer());
        } catch (error) {
          console.error("Error fetching PDF:", error);
          throw error;
        }
      });

      // STEP 2: Extract Text
      const policyText = await step.run("extract-text", async () => {
        return extractTextFromPDF(pdfBuffer);
      });

      // STEP 3: Chunk and Store Policy Text (for semantic search)
      // await step.run("ingest-policy-chunks", async () => {
      //   const chunks = chunkText(policyText);
      //   await storePolicyChunks(policy.id, chunks);
      //   console.log(`Policy ${policy.id} indexed with ${chunks.length} chunks`);
      // });

      // STEP 4: Retrieve Relevant Sections
      // const formattedChunks = await step.run(
      //   "retrieve-relevant-chunks",
      //   async () => {
      //     const policyChunks = await retrieveRelevantChunks(policy.id, query);
      //     return formatChunks(policyChunks);
      //   },
      // );

      // STEP 5: Final Reasoning
      const decision = await step.run("final-decision", async () => {
        const prompt = `
        You are a bank compliance expert analyzing policy documents.

        Policy Sections:
        ${policyText}

        User Question:
        ${query}
        
        ${documentQuery ? `Specific Document Query: ${documentQuery}` : ""}

        Your task is to go through the policy text and find the relevant sections that answer the user question.
        which are in User questions and specific document query.

        OUTPUT RULES (VERY IMPORTANT):
        - Return ONLY a valid JSON object
        - Do NOT wrap the response in markdown
        - Do NOT use \`\`\`
        - Do NOT add explanations outside JSON
        - The response MUST be directly parseable by JSON.parse()

        JSON SCHEMA:
        {
          "status": "APPROVED" | "REJECTED" | "ACTION_REQUIRED",
          "explanation": "string",
          "relevant_sections": ["string"],
          "recommendation": "string",
          "confidence_score": number
        }
       
        Give your recommendation in plain-simple english and which directly states the result, just like a bank manager would explain it to a customer.
        `;
        return askLLM(prompt);
      });

      // STEP 6: Store Result
      const finalResult = await step.run("store-result", async () => {
        try {
          // Parse decision to validate JSON format
          let parsedDecision;
          try {
            parsedDecision = JSON.parse(decision);
          } catch (parseError) {
            // If LLM didn't return valid JSON, wrap it
            parsedDecision = {
              status: "ACTION_REQUIRED",
              explanation: decision,
              relevant_sections: [],
              recommendation:
                "Review required - LLM response was not in expected format",
            };
          }

          // Insert into evaluations table with all required fields
          const { data, error } = await supabaseAdmin
            .from("evaluations")
            .insert({
              user_id: event.data.userId,
              policy_id: policy.id,
              policy_type: policy.policy_type,
              policy_version: policy.version,
              query,
              document_query: documentQuery || null,
              status: parsedDecision.status || "ACTION_REQUIRED",
              result: parsedDecision,
              reasoning:
                parsedDecision.explanation ||
                parsedDecision.recommendation ||
                null,
              error_message: null,
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error("Error storing evaluation result:", error);
            throw error;
          }

          return data;
        } catch (error) {
          console.error("Error storing result:", error);
          throw error;
        }
      });
      console.log(finalResult);
      return finalResult;
    } else {
      // When conv != "0", this is a follow-up conversation
      return {
        message: "Follow-up conversation handler not yet implemented",
        conv,
      };
    }
  },
);
