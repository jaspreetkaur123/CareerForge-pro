import Resume from "../models/Resume.js";
import { analyzeJobDescription } from "../services/gemini.service.js";

// POST /api/jd/:resumeId/analyze
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

    // Call Gemini JD Analysis Agent
    const jdAnalysis = await analyzeJobDescription(jobDescription);

    resume.jobDescription = jobDescription;
    resume.jdAnalysis = jdAnalysis;
    resume.status = "analyzed";
    await resume.save();

    res.json({ message: "JD analyzed", jdAnalysis, resumeId: resume._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};