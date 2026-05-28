import { Request, Response } from "express";
import { Assessment } from "../models/Assessment";
import { addGenerationJob } from "../queues/producer";

export const createAssessment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { instructions, sectionTitle, questionTypes, dueDate } = req.body;

    //Check if the user uploaded a file
    let fileData = null;
    if (req.file) {
      fileData = {
        mimeType: req.file.mimetype,
        base64: req.file.buffer.toString("base64"), // Convert to Base64
      };
    }

    const newAssessment = await Assessment.create({
      status: "PENDING",
      title: req.body.title || undefined,
      instructions: instructions || "AI Generated Assessment",
      dueDate: dueDate || null,
    });

    await addGenerationJob(newAssessment._id.toString(), {
      instructions,
      questionTypes,
      fileData,
    });

    res.status(202).json({ success: true, assessmentId: newAssessment._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addManualQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    // Destructure 'answer' from the incoming body
    const { sectionTitle, questionText, difficulty, marks, answer } = req.body;

    const updated = await Assessment.findOneAndUpdate(
      { _id: assessmentId, "sections.title": sectionTitle },
      {
        $push: {
          "sections.$.questions": {
            text: questionText,
            difficulty,
            marks,
            answer: answer || "No answer provided",
          },
        },
      },
      { new: true },
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add manual question" });
  }
};

// Fetch all assignments for the Dashboard
export const getAllAssessments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Sort by newest first
    const assessments = await Assessment.find()
      .select("-sections")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
};

// Fetch a single assignment for the Output Page
export const getAssessmentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
};

// Delete a single assessment
export const deleteAssessment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { assessmentId } = req.params;
    const deletedAssessment = await Assessment.findByIdAndDelete(assessmentId);

    if (!deletedAssessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
      deletedId: assessmentId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete assessment" });
  }
};
