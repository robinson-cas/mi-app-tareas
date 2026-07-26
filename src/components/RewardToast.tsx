"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trophy, Gift, Coins } from "lucide-react";
import type { ToastEvento } from "@/context/GamificationContext";

interface RewardToastProps {
  evento: ToastEvento;
  onDismiss: () => void;
}

const DURACION_MS: Record<ToastEvento["tipo"], number> = {
  recompensa: 2500,
  subida_nivel: 3500,
  cofre: 3500,
};

export default function RewardToast({ evento, onDismiss }: RewardToastProps) {
  const [saliendo, setSaliendo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const duracion = DURACION_MS[evento.tipo];
    const salidaTimer = setTimeout(() => setSaliendo(true), duracion - 200);
    const cierreTimer = setTimeout(onDismiss, duracion);
    return () => {
      clearTimeout(salidaTimer);
      clearTimeout(cierreTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento.id]);

  const animClass = saliendo ? "animate-toast-out" : "animate-toast-in";

  if (evento.tipo === "recompensa") {
    return (
      <div
        className={`bg-white border-l-4 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 ${animClass}`}
        style={{ borderLeftColor: evento.color }}
      >
        <Sparkles size={18} style={{ color: evento.color }} />
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">+{evento.xp} XP</span>
          <span className="font-bold text-amber-600 flex items-center gap-1">
            <Coins size={14} />+{evento.oro} Oro
          </span>
        </div>
      </div>
    );
  }

  if (evento.tipo === "subida_nivel") {
    return (
      <div
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xl px-5 py-4 flex items-center gap-3 ${animClass}`}
      >
        <Trophy size={22} className="text-amber-300 shrink-0" />
        <div>
          <p className="font-bold">¡Subiste de nivel!</p>
          <p className="text-sm text-blue-100">
            {evento.pilar} → Nivel {evento.nivel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push("/avatar")}
      className={`bg-gray-900 text-white rounded-xl shadow-xl px-5 py-4 border border-amber-400/50 flex items-center gap-3 cursor-pointer ${animClass}`}
    >
      <Gift size={22} className="text-amber-400 shrink-0" />
      <div>
        <p className="font-bold">¡Cofre desbloqueado!</p>
        <p className="text-sm text-gray-300">Ábrelo en tu Avatar</p>
      </div>
    </div>
  );
}
