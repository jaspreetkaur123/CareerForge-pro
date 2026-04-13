import Resume from "../models/Resume.js";
import User from "../models/User.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { rewriteResume, calculateATSScore } from "../services/gemini.service.js";
<<<<<<< HEAD
=======
import { generatePDF } from "../services/puppeteer.service.js";
>>>>>>> 4b9da61 (main)

// POST /api/resume  — create blank resume
export const createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      userId: req.user._id,
      title: req.body.title || "Untitled Resume",
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resume  — list user's resumes
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select("title atsScore status template createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resume/:id  — get single resume
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/resume/:id  — update resume fields
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/resume/:id
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/resume/:id/upload-raw — store raw plain-text resume
export const uploadRawText = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ message: "rawText is required" });
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rawText, status: "draft" },
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/resume/:id/upload-pdf — parse PDF and store extracted text
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Extract text from the uploaded PDF buffer
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text?.trim();

    if (!rawText) {
      return res.status(422).json({ message: "Could not extract text from PDF. Try pasting the text manually." });
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rawText, status: "draft" },
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    res.json({ message: "PDF parsed successfully", rawText, resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/resume/:id/rewrite — AI-powered resume rewrite
export const rewriteResumeHandler = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    if (!resume.rawText) {
      return res.status(400).json({ message: "Upload your resume text first via /upload-raw or /upload-pdf" });
    }

    if (!resume.jdAnalysis?.keywords?.length) {
      return res.status(400).json({ message: "Analyze a Job Description first via /api/jd/:id/analyze" });
    }

    // Call Gemini Resume Rewrite Agent
    const rewrittenData = await rewriteResume(resume.rawText, resume.jdAnalysis);

    // Calculate ATS score from rewritten text
    const rewrittenText = JSON.stringify(rewrittenData);
    const atsScore = calculateATSScore(rewrittenText, resume.jdAnalysis);

    resume.rewrittenData = rewrittenData;
    resume.atsScore = atsScore;
    resume.status = "rewritten";
    await resume.save();

    res.json({
      message: "Resume rewritten successfully",
      atsScore,
      rewrittenData,
      resumeId: resume._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
<<<<<<< HEAD
=======

// POST /api/resume/:id/export  — generate and stream PDF
export const exportResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    if (!resume.rewrittenData || !resume.rewrittenData.name) {
      return res.status(400).json({
        message: "Resume has not been rewritten yet. Run /rewrite first.",
      });
    }

    // Allow caller to override the template via query or body
    const template =
      req.body?.template ||
      req.query?.template ||
      resume.template ||
      "classic";

    const validTemplates = ["classic", "modern", "minimal"];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({
        message: `Invalid template. Choose one of: ${validTemplates.join(", ")}.`,
      });
    }

    // Persist the chosen template on the resume document
    if (template !== resume.template) {
      resume.template = template;
    }
    resume.status = "exported";
    await resume.save();

    // Generate PDF buffer via Puppeteer
    const pdfBuffer = await generatePDF(resume.rewrittenData, template);

    // Build a safe filename
    const firstName = (resume.rewrittenData.name || "resume")
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const filename = `${firstName}_resume_${template}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ message: err.message });
  }
};
>>>>>>> 4b9da61 (main)
