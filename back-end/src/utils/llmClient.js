
// ---------------------------------------> OPEN A.I AND DEEPSEEK <-----------------------------------------
/*
  - THIS IS THE LLM RESPONSE MODULE
  - BASIC CONFIG TO TO LLM
  - PROMPT AND REPLY DONE HERE
*/
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const askLLM = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 4096,
      messages: [{ role: "system", content: prompt }],
    });

    if (response.choices[0].message.content) {
      return response.choices[0].message.content;
    }

    throw new Error("Empty response from deepseek");
  } catch (error) {
    console.error("deepseek error:", error);
    throw new Error(`Failed to get LLM response: ${error.message}`);
  }
};
