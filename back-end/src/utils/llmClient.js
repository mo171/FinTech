// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";

// dotenv.config({ path: "./.env" });

// const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY);

// export const askLLM = async (prompt) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-pro", // ✅ WORKING MODEL
//     });

//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   } catch (error) {
//     console.error("Gemini error:", error);
//     throw new Error(`Failed to get LLM response: ${error.message}`);
//   }
// };


import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});


const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY
});

export const askLLM = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return response.choices[0].message.content;
};
