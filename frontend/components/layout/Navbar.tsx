"use client";
import { Bell, Menu, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  title: string;
  showBack?: boolean;
  isIcon?: boolean;
  icon?: React.ReactNode;
}

export default function Navbar({
  title,
  showBack = true,
  isIcon = false,
  icon,
}: NavbarProps) {
  const router = useRouter();

  return (
    <header className="flex-none w-full min-h-[76px] bg-[#FFFFFFBF] rounded-3xl p-2 md:p-3 flex items-center justify-between shadow-sm border border-gray-100">
      <div className="hidden md:flex items-center gap-4 p-2 text-gray-500">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="text-xl font-semibold text-gray-900 hover:text-gray-600 bg-white rounded-full w-8 h-8 "
          >
            ←
          </button>
        )}
        <div className="flex items-center gap-2">
          {isIcon && (
            <div className="w-6 h-6 text-[#A9A9A9] flex items-center justify-center">
              {icon}
            </div>
          )}
          <span className="font-medium text-[#A9A9A9]">{title}</span>
        </div>
      </div>

      <div className="flex md:hidden items-center gap-2 px-2">
        <div className="w-8 h-8 bg-[#1e1e1e] rounded-lg flex items-center justify-center text-white font-bold text-lg">
          V
        </div>
        <h1 className="text-xl font-bold text-gray-900">VedaAI</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
          <Bell size={25} className="text-gray-600" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF5623] rounded-full border-2 border-white"></div>
        </div>

        <div className="w-8 h-8 bg-orange-100 rounded-full border border-orange-200 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src="/images/user_place.jpg"
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="hidden md:block text-sm text-black font-semibold">
            John Doe
          </span>
          <ChevronDown size={18} className="text-black font-bold" />
        </div>
        <button className="md:hidden p-2 text-gray-600">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
