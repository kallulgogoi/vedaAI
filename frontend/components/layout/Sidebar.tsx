"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import {
  Users,
  FileText,
  Settings,
  Sparkles,
  LayoutGrid,
  Book,
  ChartPie,
} from "lucide-react";

import { useAssessmentStore } from "@/store/useAssessmentStore";

export default function Sidebar() {
  const pathname = usePathname();

  const { assessments, fetchAssessments } = useAssessmentStore();

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const assignmentCount = assessments?.length || 0;

  const navItems = [
    { name: "Home", icon: LayoutGrid, path: "/Home" },
    { name: "My Groups", icon: Users, path: "/groups" },

    { name: "Assignments", icon: FileText, path: "/", badge: assignmentCount },
    { name: "AI Teacher's Toolkit", icon: Book, path: "/toolkit" },
    { name: "My Library", icon: ChartPie, path: "/library" },
  ];

  return (
    <aside className="hidden md:flex w-[280px] h-[calc(100vh-32px)] bg-white rounded-3xl m-4 flex-col shadow-sm border border-gray-100">
      <div className="p-6 flex items-center gap-1">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <Image
            src="/images/logo1.png"
            alt="VedaAI Logo"
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-none">
          VedaAI
        </h1>
      </div>

      <div className="px-6 pb-6">
        <Link href="/assignments/create">
          <button className="w-full bg-[#1e1e1e] hover:bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 transition-all ring-4 ring-[#FF7950]">
            <Sparkles size={18} className="text-orange-400" />
            <span className="font-medium text-sm">Create Assignment</span>
          </button>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${isActive ? "bg-[#F0F0F0] text-gray-900 font-medium" : "text-[#5E5E5ECC] hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={isActive ? "text-gray-700" : "text-gray-400"}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>

                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 px-4 py-3 text-[#5E5E5ECC] hover:bg-gray-50 rounded-xl cursor-pointer mb-2">
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </div>
        <div className="bg-[#F0F0F0] rounded-2xl p-3 pt-4 pb-4 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white">
            <Image
              src="/images/user_place.jpg"
              alt="User Placeholder"
              fill
              className="object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">
              Delhi Public School
            </p>
            <p className="text-xs text-[#5E5E5ECC] mt-1 truncate">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
