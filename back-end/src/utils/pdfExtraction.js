import pdf from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  const data = await pdf(buffer);
  return data.text;
};