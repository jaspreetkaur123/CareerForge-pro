import Resume from "../models/Resume.js";
// POST /api/jd/:resumeId/analyze
// Accepts jobDescription text, calls Gemini agent (Phase 2), stores result
export const analyzeJD = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "jobDescription is required" });
    }
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    // Gemini service will be wired in Phase 2
    // const jdAnalysis = await analyzeJobDescription(jobDescription);
    const jdAnalysis = { keywords: [], mustHave: [], niceToHave: [], tone: "technical", jobTitle: "" };
    resume.jobDescription = jobDescription;
    resume.jdAnalysis = jdAnalysis;
    resume.status = "analyzed";
    await resume.save();
    res.json({ message: "JD analyzed", jdAnalysis, resumeId: resume._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};