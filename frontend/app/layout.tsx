import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { Bricolage_Grotesque } from "next/font/google";
import { LayoutGrid, ClipboardList, BookMarked, Sparkles } from "lucide-react";
import Link from "next/link";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata = {
  title: "VedaAI Dashboard",
  description: "AI-powered teacher toolkit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.className} bg-[#e5e5e5] md:bg-gray-200/50 flex h-screen overflow-hidden`}
      >
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto p-4 md:pr-4 md:py-4 pb-28 md:pb-4">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-[#1a1a1a] rounded-[2rem] px-6 py-4 flex justify-between items-center z-40 shadow-2xl print:hidden">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <LayoutGrid size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-white"
          >
            <ClipboardList size={20} />
            <span className="text-[10px] font-medium">Assignments</span>
          </Link>
          <Link
            href="/library"
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <BookMarked size={20} />
            <span className="text-[10px] font-medium">Library</span>
          </Link>
          <Link
            href="/toolkit"
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <Sparkles size={20} />
            <span className="text-[10px] font-medium">AI Toolkit</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
