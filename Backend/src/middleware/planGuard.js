import Resume from "../models/Resume.js";
const FREE_RESUME_LIMIT = 1;
/**
 * Blocks free users from creating more resumes than allowed.
 * Attach to any route that creates a new resume.
 */
const planGuard = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.plan === "pro") {
      return next(); // Pro users have no limits
    }
    const resumeCount = await Resume.countDocuments({ userId: user._id });
    if (resumeCount >= FREE_RESUME_LIMIT) {
      return res.status(403).json({
        message: `Free plan allows only ${FREE_RESUME_LIMIT} resume. Upgrade to Pro for unlimited resumes.`,
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
export default planGuard;
