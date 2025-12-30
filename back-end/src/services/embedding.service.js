/*
 * VOYAGE AI EMBEDDING SERVICE
 * This service is responsible for converting text into numerical vector embeddings.
 * It is primarily used in:
 * - chunks.service.js (for storing policy segments and searching)
 */
import { VoyageAIClient } from "voyageai";
import dotenv from "dotenv";

// - CONFIGURATION
dotenv.config({
  path: "./.env",
});

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

/**
 * generateEmbedding
 * Takes a string of text and returns a vector embedding.
 * Uses the 'voyage-3' model.
 * Note: The embedding is truncated to 768 dimensions to align with the database schema.
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty for embedding generation");
    }

    // - API CALL TO VOYAGE AI
    const response = await voyage.embed({
      model: "voyage-3",
      input: text,
    });

    if (response.data && response.data.length > 0) {
      // Truncate to 768 dimensions to match database schema (pgvector)
      return response.data[0].embedding.slice(0, 768);
    }

    throw new Error("Empty response from Voyage AI");
  } catch (error) {
    console.error("Error generating embedding with Voyage AI:", error);
    throw new Error(
      `Failed to generate embedding: ${error.message || "Unknown error"}`,
    );
  }
};
