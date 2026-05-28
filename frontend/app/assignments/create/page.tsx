"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Plus,
  X,
  Mic,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CalendarPlus2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const defaultTypes = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { createAssessment } = useAssessmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [questionRows, setQuestionRows] = useState<QuestionTypeRow[]>([
    { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: "2", type: "Short Questions", count: 3, marks: 2 },
    { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
  ]);

  const totalQuestions = questionRows.reduce((acc, row) => acc + row.count, 0);
  const totalMarks = questionRows.reduce(
    (acc, row) => acc + row.count * row.marks,
    0,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const addQuestionRow = () => {
    setQuestionRows([
      ...questionRows,
      { id: Date.now().toString(), type: defaultTypes[0], count: 1, marks: 1 },
    ]);
  };

  const removeQuestionRow = (id: string) => {
    setQuestionRows(questionRows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof QuestionTypeRow, value: any) => {
    setQuestionRows(
      questionRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleGenerate = async () => {
    // Validation: Check if file and due date exist before proceeding
    if (!file || !dueDate) {
      return toast.error("Document and Due Date are required.");
    }

    if (totalQuestions === 0)
      return toast.error("Please add at least one question.");

    setIsGenerating(true);

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("instructions", instructions);
    formData.append("dueDate", dueDate);
    formData.append("questionTypes", JSON.stringify(questionRows));

    const assessmentId = await createAssessment(formData);

    if (assessmentId) {
      const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
      socket.emit("join-room", assessmentId);

      socket.on("generation-success", () => {
        toast.success("AI Generation Complete!");
        socket.disconnect();
        router.push(`/assignments/${assessmentId}`);
      });

      socket.on("generation-failed", () => {
        toast.error("AI Generation Failed.");
        setIsGenerating(false);
        socket.disconnect();
      });
    } else {
      setIsGenerating(false);
    }
  };

  // Helper variable for disabled state
  const isFormIncomplete = !file || !dueDate;

  return (
    <>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="flex flex-col h-full w-full max-w-7xl mx-auto space-y-4 relative">
        <Navbar title="Assignment" />

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              VedaAI is generating your assignment...
            </h2>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
          {/* Header Title */}
          <div className="max-w-5xl mx-auto w-full">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-5 h-5 bg-[#A7F3D0] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#22C55E] rounded-full shadow-lg"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Assignment
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Set up a new assignment for your students
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex gap-2 mb-8">
              <div className="h-1.5 w-1/2 bg-gray-800 rounded-full"></div>
              <div className="h-1.5 w-1/2 bg-gray-200 rounded-full"></div>
            </div>

            {/* Main White Card */}
            <div className="bg-[#FFFFFF80] rounded-[2rem] p-8 shadow-sm border-2 border-white">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                Assignment Details
              </h3>
              <p className="text-sm text-[#30303099] mb-8">
                Basic information about your assignment
              </p>

              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-[#00000033] rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-4 bg-white"
              >
                <UploadCloud className="w-8 h-8 text-gray-900 mb-4" />
                {file ? (
                  <p className="font-bold text-gray-900">{file.name}</p>
                ) : (
                  <>
                    <p className="font-bold text-gray-900 mb-1 text-center">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="text-xs text-gray-400 font-medium mb-4">
                      JPEG, PNG, upto 10MB
                    </p>
                    <button className="bg-gray-100 text-gray-700 px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                      Browse Files
                    </button>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-center text-sm text-[#30303099] font-medium mb-10">
                Upload images of your preferred document/image
              </p>

              {/* Due Date */}
              <div className="mb-10">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    placeholder="DD-MM-YYYY"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-transparent border border-gray-200 rounded-2xl py-3.5 px-4 pr-10 text-sm focus:outline-none focus:border-gray-400 text-gray-900"
                  />
                  <CalendarPlus2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Question Types */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 px-1">
                  <label className="text-sm font-bold text-gray-900">
                    Question Type
                  </label>
                  {/* Global Desktop Headers - Hidden on mobile */}
                  <div className="hidden md:flex gap-16 text-sm font-bold text-gray-900 pr-4">
                    <span>No. of Questions</span>
                    <span>Marks</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {questionRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col md:flex-row md:items-center gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-[2rem] md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-transparent"
                    >
                      {/* Left Side (Desktop) / Top Row (Mobile) */}
                      <div className="flex items-center gap-4 w-full md:flex-1 md:w-auto">
                        <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden relative">
                          <select
                            value={row.type}
                            onChange={(e) =>
                              updateRow(row.id, "type", e.target.value)
                            }
                            className="w-full bg-transparent py-3.5 px-4 text-sm font-medium text-gray-900 outline-none appearance-none"
                          >
                            {defaultTypes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          {/* Custom Dropdown Arrow */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                              width="12"
                              height="8"
                              viewBox="0 0 12 8"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 1.5L6 6.5L11 1.5"
                                stroke="#111827"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>

                        <button
                          onClick={() => removeQuestionRow(row.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Right Side (Desktop) / Bottom Row (Mobile) */}
                      <div className="flex bg-[#F5F5F5] md:bg-transparent rounded-3xl md:rounded-none p-4 md:p-0 gap-4 md:gap-6 w-full md:w-auto">
                        {/* Count Pill Group */}
                        <div className="flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-0">
                          <span className="text-xs font-bold text-gray-900 md:hidden mb-1">
                            No. of Questions
                          </span>
                          <div className="flex items-center justify-between md:justify-center bg-white border border-gray-200 rounded-full px-1 py-1 w-full max-w-[140px] md:max-w-none md:w-auto mx-auto md:mx-0">
                            <button
                              onClick={() =>
                                updateRow(
                                  row.id,
                                  "count",
                                  Math.max(1, row.count - 1),
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {row.count}
                            </span>
                            <button
                              onClick={() =>
                                updateRow(row.id, "count", row.count + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Marks Pill Group */}
                        <div className="flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-0">
                          <span className="text-xs font-bold text-gray-900 md:hidden mb-1">
                            Marks
                          </span>
                          <div className="flex items-center justify-between md:justify-center bg-white border border-gray-200 rounded-full px-1 py-1 w-full max-w-[140px] md:max-w-none md:w-auto mx-auto md:mx-0">
                            <button
                              onClick={() =>
                                updateRow(
                                  row.id,
                                  "marks",
                                  Math.max(1, row.marks - 1),
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {row.marks}
                            </span>
                            <button
                              onClick={() =>
                                updateRow(row.id, "marks", row.marks + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addQuestionRow}
                  className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-900 hover:opacity-80 transition-opacity"
                >
                  <div className="bg-gray-900 text-white rounded-full p-1">
                    <Plus size={16} />
                  </div>
                  Add Question Type
                </button>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col items-end gap-1 mb-10 text-sm text-gray-900 border-t border-gray-100 pt-6">
                <p>
                  Total <span className="underline">Q</span>uestions :{" "}
                  <span className="font-bold">{totalQuestions}</span>
                </p>
                <p>
                  Total Marks : <span className="font-bold">{totalMarks}</span>
                </p>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Additional Information (For better output)
                </label>
                <div className="relative">
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    className="w-full bg-transparent border border-gray-200 rounded-2xl py-4 px-4 pr-12 text-sm font-medium focus:outline-none focus:border-gray-400 min-h-[120px] resize-none text-gray-900 placeholder:text-gray-400"
                  ></textarea>
                  <button className="absolute bottom-4 right-4 text-gray-900 hover:opacity-70 bg-gray-100 p-2 rounded-full">
                    <Mic size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 py-6 flex justify-between bg-gradient-to-t from-gray-200/90 via-gray-200/80 to-transparent">
          <button
            onClick={() => router.back()}
            className="bg-white text-gray-900 rounded-full py-3.5 px-8 flex items-center gap-2 font-bold hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowLeft size={18} /> Previous
          </button>
          <button
            onClick={handleGenerate}
            disabled={isFormIncomplete}
            className={`bg-[#1a1a1a] text-white rounded-full py-3.5 px-10 flex items-center gap-2 font-bold shadow-md transition-all ${
              isFormIncomplete
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black"
            }`}
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
