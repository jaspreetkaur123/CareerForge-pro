import { Router } from "express";
import auth from "../middleware/auth.js";
import planGuard from "../middleware/planGuard.js";
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  uploadRawText,
} from "../controllers/resume.controller.js";
const router = Router();
// All resume routes are protected
router.use(auth);
router.post("/", planGuard, createResume);   // planGuard only on create
router.get("/", getResumes);
router.get("/:id", getResume);
router.patch("/:id", updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/upload-raw", uploadRawText);
export default router;