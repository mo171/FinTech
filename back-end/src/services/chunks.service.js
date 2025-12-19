import { supabaseAdmin } from "../utils/supabase.js";
import { generateEmbedding } from "./embedding.service.js";

export const chunkText = (text, maxWords = 200) => {
  const sentences = text.split(". ");
  const chunks = [];

  let currentChunk = "";
  let index = 0;

  for (const sentence of sentences) {
    if ((currentChunk + sentence).split(" ").length > maxWords) {
      chunks.push({
        chunk_index: index++,
        content: currentChunk.trim(),
      });
      currentChunk = sentence;
    } else {
      currentChunk += sentence + ". ";
    }
  }

  if (currentChunk) {
    chunks.push({
      chunk_index: index,
      content: currentChunk.trim(),
    });
  }

  return chunks;
};

export const storePolicyChunks = async (policyId, chunks) => {
  try {
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      const { error } = await supabaseAdmin.from("policy_chunks").insert({
        policy_id: policyId,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        embedding,
      });
      console.log(`Chunk ${chunk.chunk_index} stored successfully`);

      if (error) {
        console.error(`Error storing chunk ${chunk.chunk_index}:`, error);
        throw error;
      }
    }
    console.log(`All chunks stored successfully`);
  } catch (error) {
    console.error("Error in storePolicyChunks:", error);
    throw error;
  }
};

export const formatChunks = (chunks) => {
  return chunks
    .map(
      (c) =>
        `[Section ${c.chunk_index} | relevance: ${c.similarity.toFixed(2)}]\n${
          c.content
        }`,
    )
    .join("\n\n");
};

/**
 * Retrieve relevant chunks for a given policy and query
 * Generates embedding from query text and performs semantic search
 */
export async function retrieveRelevantChunks(policyId, query) {
  try {
    // Generate embedding from the query text
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc("match_policy_chunks", {
      policy_id: policyId,
      query_embedding: queryEmbedding,
      match_count: 5,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error retrieving relevant chunks:", error);
    throw error;
  }
}
