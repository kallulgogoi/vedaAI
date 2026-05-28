import { create } from "zustand";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";

export interface Assessment {
  _id: string;
  title?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  instructions: string;
  dueDate?: string;
  createdAt: string;
}

interface AssessmentStore {
  assessments: Assessment[];
  isLoading: boolean;
  fetchAssessments: () => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  createAssessment: (formData: FormData) => Promise<string | null>;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  assessments: [],
  isLoading: false,

  fetchAssessments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/assessments");
      set({ assessments: response.data.data });
    } catch (error) {
      console.error("Failed to fetch assessments", error);
      toast.error("Failed to load assignments");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAssessment: async (id: string) => {
    try {
      await api.delete(`/assessments/${id}`);
      set((state) => ({
        assessments: state.assessments.filter((a) => a._id !== id),
      }));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete assignment");
    }
  },
  createAssessment: async (formData: FormData) => {
    try {
      const response = await api.post("/assessments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.assessmentId;
    } catch (error) {
      console.error("Failed to start generation", error);
      toast.error("Failed to start generation");
      return null;
    }
  },
}));
