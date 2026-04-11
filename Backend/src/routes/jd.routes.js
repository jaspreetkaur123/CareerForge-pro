import { Router } from "express";
import auth from "../middleware/auth.js";
import { analyzeJD } from "../controllers/jd.controller.js";
const router = Router();
router.use(auth);
router.post("/:resumeId/analyze", analyzeJD);
export default router;