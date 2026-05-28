import { Worker } from "bullmq";
import Redis from "ioredis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Assessment } from "../models/Assessment";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Connect to Redis
const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: redisUrl.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Pass the Socket.io instance into the worker so it can emit events
export const setupWorker = (io: Server) => {
  new Worker(
    "assessment-generation",
    async (job) => {
      const { assessmentId, payload } = job.data;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptText = `
    You are an expert teacher. Create an assessment based on the provided instructions and file (if any).
    Also, generate a concise, professional title for this assignment (e.g., 'Science: Quiz on Electricity', 'Class 8 Mathematics Test').

    Instructions: ${payload.instructions}
    Requirements: ${JSON.stringify(payload.questionTypes)}
    
    Return ONLY a valid JSON object matching this exact structure:
    {
      "title": "Your generated title here",
      "sections": [
        {
          "title": "Section A",
          "instruction": "Attempt all questions",
          "questions": [
            { 
              "text": "Question 1?", 
              "difficulty": "Easy", 
              "marks": 2,
              "answer": "Provide the exact correct answer here, or a short grading rubric for long-form questions." 
            }
          ]
        }
      ]
    }
  `;

        // Construct the array of things to send to Gemini
        const promptContents: any[] = [{ text: promptText }];

        if (payload.fileData) {
          promptContents.push({
            inlineData: {
              data: payload.fileData.base64,
              mimeType: payload.fileData.mimeType,
            },
          });
        }

        console.log("Sending prompt to Gemini:", promptContents);

        // Call Gemini
        const result = await model.generateContent({
          contents: [{ role: "user", parts: promptContents }],
          generationConfig: { responseMimeType: "application/json" },
        });

        const generatedData = JSON.parse(result.response.text());

        // Save to MongoDB
        const completedAssessment = await Assessment.findByIdAndUpdate(
          assessmentId,
          {
            status: "COMPLETED",
            title: generatedData.title,
            sections: generatedData.sections,
          },
          { new: true },
        );

        // Tell the frontend
        io.to(assessmentId).emit("generation-success", completedAssessment);
      } catch (error) {
        console.error("Worker Error:", error);
        await Assessment.findByIdAndUpdate(assessmentId, { status: "FAILED" });
        io.to(assessmentId).emit("generation-failed", {
          error: "AI generation failed.",
        });
      }
    },
    { connection: redisConnection },
  );
};
