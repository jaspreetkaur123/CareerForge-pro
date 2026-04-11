import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  startDate: String,
  endDate: String,
  bullets: [String],
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startDate: String,
  endDate: String,
  gpa: String,
});

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Resume",
    },

    // Raw input from user
    rawText: {
      type: String,
      default: "",
    },

    // Pasted or analyzed Job Description
    jobDescription: {
      type: String,
      default: "",
    },

    // Extracted JD keywords from Gemini JD Agent
    jdAnalysis: {
      keywords: [String],
      mustHave: [String],
      niceToHave: [String],
      tone: String,
      jobTitle: String,
    },

    // Rewritten structured resume from Gemini Rewrite Agent
    rewrittenData: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      summary: String,
      experience: [experienceSchema],
      education: [educationSchema],
      skills: [String],
      certifications: [String],
    },

    // Calculated after rewrite
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Selected PDF template
    template: {
      type: String,
      enum: ["classic", "modern", "minimal"],
      default: "classic",
    },

    status: {
      type: String,
      enum: ["draft", "analyzed", "rewritten", "exported"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
