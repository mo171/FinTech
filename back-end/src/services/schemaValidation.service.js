/*
 * schemaValidation.service.js
 * used for schema validation
 * the llm was facing problem structuring the json response this hepled
 * so dont forget to use this function
 */

import { z } from "zod";

export const DecisionSchema = z.object({
  relevant_sections: z.array(z.string()),
  response: z.string(),
  responseforfurtherllm: z.string(),
});

export const ExtractionSchema = z.object({
  type: z.string().nullable(),
  query: z.string(),
  conv: z.string().or(z.number()).transform(String).default("0"),
});
