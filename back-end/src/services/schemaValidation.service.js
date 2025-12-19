import { z } from "zod";

export const DecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ACTION_REQUIRED"]),
  explanation: z.string(),
  relevant_sections: z.array(z.string()),
  recommendation: z.string(),
  response: z.string(),
  responseforfurtherllm: z.string(),
});
