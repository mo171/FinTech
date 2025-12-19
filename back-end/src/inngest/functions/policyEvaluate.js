import { inngest } from "../client.js";
import { extractTextFromPDF } from "../../utils/pdfExtraction.js";
import { askLLM } from "../../utils/llmClient.js";
import { supabaseAdmin } from "../../utils/supabase.js";

export const policyEvaluate = inngest.createFunction(
  { name: "Policy Evaluation Workflow" },
  { event: "policy/evaluate" },

  async ({ event, step }) => {
    const { policy, query, documentQuery } = event.data;

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

    // STEP 3: Find Relevant Sections
    const relevantText = await step.run("find-relevant-text", async () => {
      const prompt = `
      Extract sections relevant to the query.

      Query: ${query}
      ${documentQuery ? `Additional context: ${documentQuery}` : ""}

      Policy Text:
      ${policyText.slice(0, 6000)}

      Return only the relevant text sections.
      `;
      return askLLM(prompt);
    });

    // STEP 4: Final Reasoning
    const decision = await step.run("final-decision", async () => {
      const prompt = `
      You are a bank compliance expert analyzing policy documents.

      Policy Sections:
      ${relevantText}

      User Question:
      ${query}
      
      ${documentQuery ? `Specific Document Query: ${documentQuery}` : ""}

      Rules:
      - Use only the provided policy text
      - Respond in JSON format with the following structure:
        {
          "status": "APPROVED" | "REJECTED" | "ACTION_REQUIRED",
          "explanation": "detailed reasoning",
          "relevant_sections": ["section 1", "section 2"],
          "recommendation": "your recommendation",
          "confidence_score": 0.0 to 1.0 (your confidence in this assessment)
        }
      - If the policy information is unclear or insufficient, set status to "ACTION_REQUIRED"
      - Set confidence_score based on how clear and complete the policy information is
      `;
      return askLLM(prompt);
    });

    // STEP 5: Store Result
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
            confidence_score: parsedDecision.confidence_score || null,
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

    // Return the stored evaluation result
    return finalResult;
  },
);
