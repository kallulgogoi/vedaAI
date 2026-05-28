"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Plus,
  Loader2,
  Trash2,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { useAssessmentStore } from "@/store/useAssessmentStore";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function HomePage() {
  const { assessments, isLoading, fetchAssessments, deleteAssessment } =
    useAssessmentStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full space-y-6 md:space-y-4 relative">
      <Toaster position="top-right" />

      <Navbar
        title="Assignment"
        showBack={true}
        isIcon={true}
        icon={<LayoutGrid size={20} />}
      />
      <div className="md:hidden flex items-center justify-center relative mt-2 mb-2">
        <button className="absolute left-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Assignments</h2>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-40 no-scrollbar px-2"
        onClick={() => setActiveMenu(null)}
      >
        <div className="mb-6 flex flex-col gap-4">
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#A7F3D0] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#22C55E] rounded-full shadow-lg"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Manage and create assignments for your classes.
            </p>
          </div>

          {assessments.length > 0 && (
            <div className="flex items-center justify-between bg-white p-2 pl-4 rounded-3xl shadow-sm border border-gray-200 mt-2">
              <button className="flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-gray-900 pr-4 border-r border-gray-200 transition-colors">
                <Filter size={18} strokeWidth={2} /> Filter By
              </button>

              <div className="flex-1 md:ml-150 flex border border-[#00000033] p-1 rounded-3xl items-center">
                <Search size={18} className="text-gray-400 shrink-0 ml-2" />
                <input
                  type="text"
                  placeholder="Search Assignment"
                  className="w-full bg-transparent border-none py-2 px-3 text-sm font-medium focus:outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic State Rendering */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : assessments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="w-64 h-64 bg-gray-100/50 rounded-full mb-6 flex items-center justify-center">
              <Image
                src="/images/empty-state.png"
                alt="Empty State Illustration"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No assignments yet
            </h3>
            <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
              Create your first assignment to start collecting and grading
              student submissions. You can set up rubrics, define marking
              criteria, and let AI assist with grading.
            </p>
          </div>
        ) : (
          /* Filled State Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-0">
            {assessments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-auto min-h-[140px] hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col pr-8">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1">
                      {assignment.title ||
                        assignment.instructions ||
                        "Untitled Assignment"}
                    </h3>
                  </div>

                  {/* Dropdown Menu Trigger */}
                  <div className="absolute right-4 top-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(
                          activeMenu === assignment._id ? null : assignment._id,
                        );
                      }}
                      className="text-[#A9A9A9] hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                    >
                      <MoreVertical size={20} strokeWidth={2.5} />
                    </button>

                    {/* Dropdown Menu Content */}
                    {activeMenu === assignment._id && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
                        <Link href={`/assignments/${assignment._id}`}>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            View Assignment
                          </button>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAssessment(assignment._id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center md:text-sm font-bold mt-auto gap-4">
                  <span className="text-gray-900">
                    Assigned on :{" "}
                    <span className="text-gray-500 font-medium">
                      {formatDate(assignment.createdAt)}
                    </span>
                  </span>
                  <span className="text-gray-900">
                    Due :{" "}
                    <span className="text-gray-500 font-medium">
                      {assignment.dueDate
                        ? formatDate(assignment.dueDate)
                        : "--"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#e5e5e5] md:from-[#f3f4f6] to-transparent pointer-events-none flex items-end justify-center pb-8 md:pb-6 z-20">
        <Link href="/assignments/create" className="pointer-events-auto">
          <button className="bg-[#1a1a1a] hover:bg-black text-white rounded-full py-4 px-8 flex items-center gap-2 transition-transform active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <Plus size={20} strokeWidth={2.5} />
            <span className="font-bold tracking-wide">Create Assignment</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
