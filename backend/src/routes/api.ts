import { Router } from "express";
import multer from "multer";
import {
  createAssessment,
  addManualQuestion,
  getAllAssessments,
  getAssessmentById,
  deleteAssessment, // <-- 1. Import the new function
} from "../controllers/assessmentCtrl";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "VedaAI Router is working!" });
});

// GET Routes
router.get("/assessments", getAllAssessments);
router.get("/assessments/:assessmentId", getAssessmentById);

// POST Routes
router.post("/assessments", upload.single("file"), createAssessment);
router.post("/assessments/:assessmentId/manual", addManualQuestion);

// DELETE Route
router.delete("/assessments/:assessmentId", deleteAssessment);

export default router;
