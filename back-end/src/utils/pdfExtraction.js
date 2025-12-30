/* 
  - TAKES PDF-URL FROM DATA-BASE
  - PROCCESS THE PDF AND GIVES TEXT
  - CAN FIND A BETTER WAY TO DO IT PUT IT HERE 
*/
import pdf from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  const data = await pdf(buffer);
  const text = data.text;
  return text
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/Page \d+/gi, "")
    .trim();
};
