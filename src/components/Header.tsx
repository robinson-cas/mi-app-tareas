"use client";

import { Plus, User } from "lucide-react";
import { formatDateHeader } from "@/lib/helpers";

interface HeaderProps {
  onNewHabit: () => void;
}

export default function Header({ onNewHabit }: HeaderProps) {
  const fecha = formatDateHeader();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide">HÁBITOS HQ</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewHabit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            <Plus size={16} />
            Nuevo Hábito
          </button>

          <div className="text-sm text-gray-500 capitalize hidden sm:block">{fecha}</div>

          <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition">
            <User size={17} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
