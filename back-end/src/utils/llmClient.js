// ----------------------------------------> OPENAI <-----------------------------------------
/*
  - THIS IS THE LLM RESPONSE MODULE
  - BASIC CONFIG TO TO LLM
  - PROMPT AND REPLY DONE HERE
*/
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askLLM = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and fast model
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: "system", content: prompt }],
    });

    if (response.choices && response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }

    throw new Error("Empty response from OpenAI");
  } catch (error) {
    console.error("OpenAI API Error Details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
    });

    // Handle specific OpenAI error cases
    if (error.code === "invalid_api_key" || error.status === 401) {
      throw new Error(
        "OpenAI API Error: Invalid API Key. Please check your OPENAI_API_KEY in .env file",
      );
    }

    if (
      error.code === "insufficient_quota" ||
      error.message?.includes("quota")
    ) {
      throw new Error(
        "OpenAI API Error: Insufficient quota. Please add credits to your OpenAI account at https://platform.openai.com/account/billing",
      );
    }

    if (error.status === 429 || error.code === "rate_limit_exceeded") {
      throw new Error(
        "OpenAI API Error: Rate limit exceeded. Please wait and try again.",
      );
    }

    if (error.status === 503 || error.code === "service_unavailable") {
      throw new Error(
        "OpenAI API Error: Service temporarily unavailable. Please try again in a moment.",
      );
    }

    // Generic error with details
    throw new Error(
      `Failed to get LLM response: ${error.message || "Unknown error"} (Code: ${
        error.code || "N/A"
      })`,
    );
  }
};
