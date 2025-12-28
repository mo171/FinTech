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
    console.log(`🔍 RAG: Retrieving chunks for policy: ${policyId}`);
    console.log(`🔍 RAG: Query: "${query}"`);

    // Generate embedding from the query text
    const queryEmbedding = await generateEmbedding(query);
    console.log(
      `✅ RAG: Query embedding generated (${queryEmbedding.length} dimensions)`,
    );

    // Try semantic search using RPC function
    const { data, error } = await supabaseAdmin.rpc("match_policy_chunks", {
      p_policy_id: policyId,
      query_embedding: queryEmbedding,
      match_count: 5,
    });

    if (error) {
      console.error("❌ RAG: RPC function error:", error);
      console.log("⚠️ RAG: Falling back to retrieve all chunks...");

      // Fallback: Get all chunks for this policy
      const { data: allChunks, error: fallbackError } = await supabaseAdmin
        .from("policy_chunks")
        .select("*")
        .eq("policy_id", policyId)
        .order("chunk_index", { ascending: true });

      if (fallbackError) throw fallbackError;

      console.log(
        `✅ RAG: Retrieved ${allChunks?.length || 0} chunks (fallback mode)`,
      );

      // Return all chunks with a default similarity score
      return (
        allChunks?.map((chunk) => ({
          ...chunk,
          similarity: 0.5, // Default similarity for fallback
        })) || []
      );
    }

    console.log(`✅ RAG: Semantic search returned ${data?.length || 0} chunks`);

    if (data && data.length > 0) {
      data.forEach((chunk, idx) => {
        console.log(
          `  📄 Chunk ${idx + 1}: similarity=${chunk.similarity?.toFixed(
            3,
          )}, preview="${chunk.content?.substring(0, 50)}..."`,
        );
      });
      return data;
    }

    // If no results from semantic search, try fallback
    console.log(
      "⚠️ RAG: No chunks found via semantic search, trying fallback...",
    );

    const { data: allChunks, error: fallbackError } = await supabaseAdmin
      .from("policy_chunks")
      .select("*")
      .eq("policy_id", policyId)
      .order("chunk_index", { ascending: true });

    if (fallbackError) throw fallbackError;

    console.log(
      `✅ RAG: Retrieved ${allChunks?.length || 0} chunks (fallback mode)`,
    );

    // Return all chunks with a default similarity score
    return (
      allChunks?.map((chunk) => ({
        ...chunk,
        similarity: 0.5, // Default similarity for fallback
      })) || []
    );
  } catch (error) {
    console.error("❌ RAG: Error retrieving relevant chunks:", error);
    throw error;
  }
}
