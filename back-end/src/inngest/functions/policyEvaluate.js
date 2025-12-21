/* 
  - INNGEST WORKFLOW FUNTION
*/

import { inngest } from "../client.js";
import { extractTextFromPDF } from "../../utils/pdfExtraction.js";
import { chunkText, storePolicyChunks } from "../../services/chunks.service.js";

export const policyEvaluate = inngest.createFunction(
  { name: "Policy Evaluation Workflow" },
  { event: "policy/evaluate" },

  async ({ event, step }) => {
    const { policy } = event.data;

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

    //  STEP 3: Chunk and Store Policy Text (for semantic search)
    await step.run("ingest-policy-chunks", async () => {
      const chunks = chunkText(policyText);
      await storePolicyChunks(policy.id, chunks);
      console.log(`Policy ${policy.id} indexed with ${chunks.length} chunks`);
    });
  },
);
