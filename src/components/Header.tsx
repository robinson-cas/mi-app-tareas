"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, User } from "lucide-react";
import { formatDateHeader } from "@/lib/helpers";
import { useGamificacion } from "@/context/GamificationContext";

export default function Header() {
  const fecha = formatDateHeader();
  const pathname = usePathname();
  const { abrirNuevoHabitoModal, cofresPendientesCount } = useGamificacion();

  const navLinkClass = (href: string) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition ${
      pathname === href
        ? "bg-blue-50 text-blue-600"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide hidden sm:block">
            HÁBITOS HQ
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <Link href="/" className={navLinkClass("/")}>
            Misiones
          </Link>
          <Link href="/tienda" className={navLinkClass("/tienda")}>
            Tienda
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {pathname === "/" && (
            <button
              onClick={abrirNuevoHabitoModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <Plus size={16} />
              Nuevo Hábito
            </button>
          )}

          <div className="text-sm text-gray-500 capitalize hidden md:block">{fecha}</div>

          <Link
            href="/avatar"
            className="relative w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition"
          >
            <User size={17} className="text-gray-600" />
            {cofresPendientesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {cofresPendientesCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
