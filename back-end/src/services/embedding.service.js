import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
});

export const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty for embedding generation");
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(
      `Failed to generate embedding: ${error.message || "Unknown error"}`,
    );
  }
};
