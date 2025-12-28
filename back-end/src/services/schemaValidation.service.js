import { z } from "zod";

export const DecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ACTION_REQUIRED"]),
  explanation: z.string(),
  relevant_sections: z.array(z.string()),
  recommendation: z.string(),
  response: z.string(),
  responseforfurtherllm: z.string(),
});

export const ExtractionSchema = z.object({
  type: z.string().nullable(),
  query: z.string(),
  conv: z.string().or(z.number()).transform(String).default("0"),
});
