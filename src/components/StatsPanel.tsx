import { HeartPulse, Brain, Users, Target, type LucideIcon } from "lucide-react";
import type { NivelArea } from "@/types";

interface StatsPanelProps {
  niveles: NivelArea[];
}

const ICONO_POR_ABREVIATURA: Record<string, LucideIcon> = {
  STR: HeartPulse,
  INT: Brain,
  SOC: Users,
  MGT: Target,
};

export default function StatsPanel({ niveles }: StatsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Estadísticas
      </h2>

      {niveles.length === 0 ? (
        <p className="text-gray-300 text-sm">Crea tus pilares para empezar a subir de nivel.</p>
      ) : (
        <div className="space-y-4">
          {niveles.map((n) => {
            const Icon = ICONO_POR_ABREVIATURA[n.abreviatura] || Target;
            return (
              <div key={n.id_area}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <Icon size={15} style={{ color: n.color }} />
                    {n.nombre}
                    <span className="text-gray-400 font-normal text-xs">({n.abreviatura})</span>
                  </span>
                  <span className="text-gray-400">
                    Nv. {n.nivel} · {n.xpEnNivelActual}/{n.xpNecesariaProximoNivel} xp
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${n.progresoPct}%`, backgroundColor: n.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
