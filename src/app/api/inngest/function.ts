import { inngest } from "./client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const evaluateAiPrompt = inngest.createFunction(
  {
    id: "evaluate-ai-prompt",
    triggers: [{ event: "ai/evaluate.prompt" }]
  },
  async ({ event, step }) => {
    const systemPrompt = event.data?.systemPrompt || "Answer strictly YES or NO.";
    const userInput = event.data?.userInput || "Hello";

    const decision = await step.run("ask-openai-for-decision", async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a strict boolean logic evaluator. Evaluate the user input based on this rule/prompt: "${systemPrompt}". You must respond ONLY with the exact word "YES" or "NO".`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        temperature: 0.1,
      });

      return response.choices[0].message.content?.trim().toUpperCase();
    });

    return { decision };
  }
);