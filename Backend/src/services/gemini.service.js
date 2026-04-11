import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" },
});
/**
 * Analyze a Job Description and extract structured keyword data.
 * @param {string} jobDescription
 * @returns {Promise<{keywords: string[], mustHave: string[], niceToHave: string[], tone: string, jobTitle: string}>}
 */
export const analyzeJobDescription = async (jobDescription) => {
  // TODO: Implement in Phase 2
  throw new Error("Gemini JD analysis not yet implemented (Phase 2)");
};
/**
 * Rewrite a resume to match extracted JD keywords.
 * @param {string} rawResumeText
 * @param {object} jdAnalysis
 * @returns {Promise<object>} Structured resume JSON
 */
export const rewriteResume = async (rawResumeText, jdAnalysis) => {
  // TODO: Implement in Phase 2
  throw new Error("Gemini resume rewrite not yet implemented (Phase 2)");
};
/**
 * Calculate ATS score based on keyword coverage.
 * @param {string} rewrittenText
 * @param {object} jdAnalysis
 * @returns {number} Score 0–100
 */
export const calculateATSScore = (rewrittenText, jdAnalysis) => {
  const text = rewrittenText.toLowerCase();
  const { mustHave = [], keywords = [] } = jdAnalysis;
  const mustHaveMatched = mustHave.filter((kw) =>
    text.includes(kw.toLowerCase())
  ).length;
  const keywordsMatched = keywords.filter((kw) =>
    text.includes(kw.toLowerCase())
  ).length;
  if (!mustHave.length && !keywords.length) return 0;
  const mustHaveScore = mustHave.length
    ? (mustHaveMatched / mustHave.length) * 60
    : 0;
  const keywordsScore = keywords.length
    ? (keywordsMatched / keywords.length) * 40
    : 0;
  return Math.round(mustHaveScore + keywordsScore);
};
export default { analyzeJobDescription, rewriteResume, calculateATSScore };
