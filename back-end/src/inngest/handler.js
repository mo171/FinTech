import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { policyEvaluate } from "./functions/policyEvaluate.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [policyEvaluate],
});
