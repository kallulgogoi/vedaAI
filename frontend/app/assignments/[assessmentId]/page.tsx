"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Edit3, Save, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import Image from "next/image";

interface Question {
  _id: string;
  text: string;
  difficulty: string;
  marks: number;
  answer: string;
}

interface Section {
  _id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

interface FullAssessment {
  _id: string;
  instructions: string;
  status: string;
  sections: Section[];
  createdAt: string;
}

export default function AssessmentOutputPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<FullAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await api.get(`/assessments/${assessmentId}`);
        setAssessment(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load the question paper.");
      } finally {
        setIsLoading(false);
      }
    };
    if (assessmentId) fetchAssessment();
  }, [assessmentId]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-area");

    if (!element) {
      toast.error("Could not find the document to print.");
      return;
    }

    toast.loading("Generating High-Quality PDF...", { id: "pdf-toast" });

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    element.style.height = "max-content";
    element.style.overflow = "visible";

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        scrollY: 0,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const margin = 15;
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page with margins
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin + position,
        pdfWidth,
        imgHeight,
      );
      heightLeft -= pageHeight;

      // Add new pages if the content overflows
      while (heightLeft > 0) {
        position -= pageHeight; // Shift the image up for the next page
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin + position,
          pdfWidth,
          imgHeight,
        );
        heightLeft -= pageHeight;
      }

      pdf.save("VedaAI_Question_Paper.pdf");
      toast.success("Downloaded successfully!", { id: "pdf-toast" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    } finally {
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
    }
  };

  const editableClass = isEditing
    ? "border-b-2 border-dashed border-orange-300 outline-none focus:bg-orange-50 transition-colors px-1 rounded"
    : "outline-none";

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full max-w-7xl mx-auto space-y-4 relative">
        <Navbar
          title="Create New"
          isIcon={true}
          icon={<Sparkles size={20} />}
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)] w-full max-w-7xl mx-auto overflow-hidden">
      <div className="flex-none pb-4">
        <Navbar
          title="Create New"
          isIcon={true}
          icon={<Sparkles size={20} />}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-[#1c1c1c] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 no-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            {/* Dark Header Card */}
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-3xl p-6 md:p-8 mb-8 shadow-lg print:hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-white text-lg font-medium mb-4 leading-relaxed max-w-2xl">
                  Certainly! Here is your customized Question Paper based on the
                  following instructions:
                  <br />
                  <span className="font-bold text-orange-400">
                    {assessment.instructions}
                  </span>
                </h2>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`rounded-full py-3 px-6 flex items-center gap-2 font-bold transition-all border-2
                  ${
                    isEditing
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-transparent border-gray-500 text-gray-300 hover:text-white hover:border-white"
                  }`}
                  >
                    {isEditing ? (
                      <>
                        <Save size={18} /> Finish Editing
                      </>
                    ) : (
                      <>
                        <Edit3 size={18} /> Edit Paper
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="bg-white hover:bg-gray-100 text-gray-900 rounded-full py-3 px-6 flex items-center gap-2 font-bold transition-colors"
                  >
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src="/images/download.png"
                        alt="Download Icon"
                        fill
                        className="object-contain"
                      />
                    </div>{" "}
                    Download as PDF
                  </button>
                </div>
              </div>
            </div>

            {/* The Document Area */}
            <div
              id="printable-area"
              className="bg-white rounded-[2rem] p-10 md:p-16 shadow-2xl text-gray-900"
            >
              <div className="text-center mb-10">
                <h1
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  className={`text-2xl font-bold mb-1 ${editableClass}`}
                >
                  Delhi Public School, Sector-4, Bokaro
                </h1>
                <h2 className="text-lg font-medium mb-1">
                  Subject:{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={editableClass}
                  >
                    English
                  </span>
                </h2>
                <h3 className="text-lg font-medium">
                  Class:{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={editableClass}
                  >
                    5th
                  </span>
                </h3>
              </div>

              <div className="flex justify-between items-center font-medium mb-8 text-sm">
                <p>
                  Time Allowed:{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={editableClass}
                  >
                    45 minutes
                  </span>
                </p>
                <p>
                  Maximum Marks:{" "}
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={editableClass}
                  >
                    20
                  </span>
                </p>
              </div>

              <p
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`font-bold mb-8 text-sm ${editableClass}`}
              >
                All questions are compulsory unless stated otherwise.
              </p>

              <div className="space-y-2 mb-10 font-bold text-sm">
                <p>Name: ______________________</p>
                <p>Roll Number: ________________</p>
                <p>Class: 5th Section: __________</p>
              </div>

              {/* Dynamic Sections & Questions */}
              {assessment.sections.map((section, sIndex) => (
                <div key={section._id || sIndex} className="mb-12">
                  <h3
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`text-lg font-bold text-center mb-4 ${editableClass}`}
                  >
                    {section.title}
                  </h3>
                  <h4
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`font-bold mb-1 ${editableClass}`}
                  >
                    {section.title.includes("Short")
                      ? "Short Answer Questions"
                      : section.title}
                  </h4>
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`italic text-sm text-gray-700 mb-6 ${editableClass}`}
                  >
                    {section.instruction}
                  </p>

                  <div className="space-y-4 text-sm">
                    {section.questions.map((q, qIndex) => (
                      <div
                        key={q._id || qIndex}
                        className="flex gap-4 leading-relaxed"
                      >
                        <span className="font-medium shrink-0 w-4 text-right">
                          {qIndex + 1}.
                        </span>
                        <p>
                          <span className="text-gray-500 mr-1">
                            [{q.difficulty}]
                          </span>
                          <span
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            className={editableClass}
                          >
                            {q.text}
                          </span>
                          <span className="text-gray-500 ml-1">
                            [
                            <span
                              contentEditable={isEditing}
                              suppressContentEditableWarning
                              className={editableClass}
                            >
                              {q.marks}
                            </span>{" "}
                            Marks]
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="font-bold text-center text-sm my-8 border-b border-gray-200 pb-12">
                End of Question Paper
              </p>

              {/* Section-wise Answer Key */}
              <div className="pt-4 mt-8 print:hidden">
                <h3 className="text-lg font-bold mb-8 text-gray-900">
                  Answer Key:
                </h3>

                {assessment.sections.map((section, sIndex) => (
                  <div key={`ans-sec-${sIndex}`} className="mb-8">
                    <h4 className="font-bold text-gray-800 mb-4 underline decoration-gray-300 underline-offset-4">
                      {section.title} Answers
                    </h4>

                    <div className="space-y-4 text-sm">
                      {section.questions.map((q, qIndex) => (
                        <div
                          key={`ans-${q._id || qIndex}`}
                          className="flex gap-4 leading-relaxed"
                        >
                          <span className="font-bold shrink-0 w-4 text-right text-gray-800">
                            {qIndex + 1}.
                          </span>

                          <p
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            className={`text-gray-700 w-full ${editableClass}`}
                          >
                            {q.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
