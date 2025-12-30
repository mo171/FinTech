/*
 * POLICY CHUNKING & SEMANTIC SEARCH SERVICE
 * This service handles the "RAG" (Retrieval Augmented Generation) logic:
 * - Splitting large policy documents into searchable chunks.
 * - Storing chunks with vector embeddings in the DB.
 * - Performing global vector searches to find relevant context for user queries.
 */
import { supabaseAdmin } from "../utils/supabase.js";
import { generateEmbedding } from "./embedding.service.js";

/**
 * chunkText
 * Splits raw policy text into smaller segments based on word count.
 * Ensures the LLM doesn't exceed context limits and search stays granular.
 */
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

/**
 * storePolicyChunks
 * Generates embeddings for each chunk and saves them to Supabase.
 * This is typically triggered after a new PDF is uploaded.
 */
export const storePolicyChunks = async (policyId, chunks) => {
  try {
    for (const chunk of chunks) {
      // - Generate vector embedding for this specific chunk
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

/**
 * formatChunks
 * Prepares the retrieved database chunks for the LLM prompt.
 * Adds metadata like section index and similarity scores.
 */
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
 * retrieveRelevantChunks
 * THE CORE OF THE SEARCH SYSTEM.
 * 1. Converts user query to an embedding.
 * 2. Calls the 'match_all_policy_chunks' RPC to find the most similar text segments.
 * 3. Returns a list of relevant snippets and their parent policy IDs.
 */
export async function retrieveRelevantChunks(query) {
  try {
    console.log(`🔍 RAG: Retrieving relevant chunks for query: "${query}"`);

    // - Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    console.log(
      `✅ RAG: Query embedding generated (${queryEmbedding.length} dimensions)`,
    );

    // - Perform global semantic search using Supabase RPC
    const { data, error } = await supabaseAdmin.rpc("match_all_policy_chunks", {
      query_embedding: queryEmbedding,
      match_count: 5,
    });

    if (error) {
      console.error("❌ RAG: RPC function error:", error);
      console.log("⚠️ RAG: Global semantic search failed.");
      return [];
    }

    console.log(`✅ RAG: Semantic search returned ${data?.length || 0} chunks`);

    if (data && data.length > 0) {
      data.forEach((chunk, idx) => {
        console.log(
          `  📄 Chunk ${idx + 1}: [Policy: ${
            chunk.policy_id
          }] similarity=${chunk.similarity?.toFixed(
            3,
          )}, preview="${chunk.content?.substring(0, 50)}..."`,
        );
      });
      return data;
    }

    // - Return empty if no relevant snippets are found
    console.log("⚠️ RAG: No relevant chunks found via semantic search.");
    return [];
  } catch (error) {
    console.error("❌ RAG: Error retrieving relevant chunks:", error);
    throw error;
  }
}
