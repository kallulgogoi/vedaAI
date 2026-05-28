import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  text: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssessment extends Document {
  title?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  instructions: string;
  dueDate?: string;
  sections: ISection[];
  createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  title: { type: String },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  instructions: { type: String },
  dueDate: { type: String },
  sections: [
    {
      title: String,
      instruction: String,
      questions: [
        {
          text: String,
          difficulty: String,
          marks: Number,
          answer: String,
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema,
);
