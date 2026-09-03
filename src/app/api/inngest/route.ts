import { serve } from "inngest/next";
import { inngest } from "./client";
import { evaluateAiPrompt } from "./function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateAiPrompt],
});