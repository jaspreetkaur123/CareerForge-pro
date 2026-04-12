import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy init — only fails at call time if key is missing, not at import
const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
};

// ─────────────────────────────────────────────
// JD ANALYSIS AGENT
// ─────────────────────────────────────────────

const JD_ANALYSIS_PROMPT = (jd) => `
You are a senior technical recruiter and ATS specialist.

Analyze the following job description and return a JSON object with EXACTLY this structure:
{
  "jobTitle": "string — standardized job title inferred from the JD",
  "keywords": ["array of top 20 important keywords/skills, ranked most to least important"],
  "mustHave": ["array of 5-8 non-negotiable hard requirements (skills, tools, certifications)"],
  "niceToHave": ["array of 3-6 preferred but optional qualifications"],
  "tone": "one of: technical | leadership | creative | analytical | customer-facing",
  "summary": "2-3 sentence summary of what the role requires"
}

Rules:
- keywords must include both technical skills AND soft skills mentioned
- mustHave must ONLY include explicitly required items (look for words like "required", "must have", "minimum")
- Return ONLY valid JSON, no markdown, no explanation

Job Description:
"""
${jd}
"""
`;

/**
 * Analyze a Job Description and extract structured keyword data.
 * @param {string} jobDescription
 * @returns {Promise<object>}
 */
export const analyzeJobDescription = async (jobDescription) => {
  const model = getModel();
  const result = await model.generateContent(JD_ANALYSIS_PROMPT(jobDescription));
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON for JD analysis");
  }
};

// ─────────────────────────────────────────────
// RESUME REWRITE AGENT
// ─────────────────────────────────────────────

const REWRITE_PROMPT = (rawResume, jdAnalysis) => `
You are an elite resume writer specializing in ATS optimization for applicant tracking systems.

Target Job: ${jdAnalysis.jobTitle || "the role described"}
Required Keywords to embed: ${jdAnalysis.mustHave?.join(", ") || "N/A"}
Additional keywords to include naturally: ${jdAnalysis.keywords?.join(", ") || "N/A"}
Writing tone: ${jdAnalysis.tone || "professional"}

Rewrite the resume below to maximize ATS score. Return a JSON object with EXACTLY this structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string or empty string",
  "github": "string or empty string",
  "summary": "3-4 sentence professional summary that naturally includes top keywords from the JD",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string (e.g. Jan 2022)",
      "endDate": "string (e.g. Mar 2024 or Present)",
      "bullets": [
        "Rewritten bullet point starting with action verb, embedding keywords naturally",
        "Quantify achievements where possible (use [X%] placeholder if actual number unknown)"
      ]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string or empty string"
    }
  ],
  "skills": ["flat array of skills, include all mustHave keywords if applicable"],
  "certifications": ["array of certifications, or empty array"]
}

Rules:
- NEVER fabricate companies, institutions, dates, or degrees
- Each experience entry must have 3-5 bullet points
- Start EVERY bullet with a strong past-tense action verb (Led, Built, Designed, Optimized, etc.)
- Naturally embed as many of the provided keywords as possible without keyword stuffing
- Keep original names, dates, companies — only rewrite bullet content and summary
- Return ONLY valid JSON, no markdown, no explanation

Original Resume Text:
"""
${rawResume}
"""
`;

/**
 * Rewrite a resume to match extracted JD keywords using Gemini.
 * @param {string} rawResumeText
 * @param {object} jdAnalysis  — output from analyzeJobDescription
 * @returns {Promise<object>}  — structured resume JSON
 */
export const rewriteResume = async (rawResumeText, jdAnalysis) => {
  const model = getModel();
  const result = await model.generateContent(REWRITE_PROMPT(rawResumeText, jdAnalysis));
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON for resume rewrite");
  }
};

// ─────────────────────────────────────────────
// ATS SCORE CALCULATOR  (pure math, no AI)
// ─────────────────────────────────────────────

/**
 * Calculate ATS score based on keyword coverage in rewritten resume text.
 * @param {string} rewrittenText  — full stringified rewritten resume
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
