"use client";

import { RendimientoArea } from "@/types";
import { getWeekNumber } from "@/lib/helpers";

interface WeeklyPerformanceProps {
  rendimiento: RendimientoArea[];
}

export default function WeeklyPerformance({ rendimiento }: WeeklyPerformanceProps) {
  const totalGanado = rendimiento.reduce((sum, a) => sum + a.puntos_ganados, 0);
  const totalMeta = rendimiento.reduce((sum, a) => sum + a.puntos_meta, 0);
  const porcentaje = totalMeta > 0 ? Math.round((totalGanado / totalMeta) * 100) : 0;
  const weekNumber = getWeekNumber();

  // SVG donut
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (Math.min(porcentaje, 100) / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-5">
        📊 Rendimiento Semanal{" "}
        <span className="text-gray-400 font-normal">(Semana {weekNumber})</span>
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Bar chart por área */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Puntos por Área
          </h3>
          {rendimiento.length === 0 ? (
            <p className="text-gray-300 text-sm">Sin datos esta semana.</p>
          ) : (
            <div className="space-y-4">
              {rendimiento.map((area) => {
                const pct =
                  area.puntos_meta > 0
                    ? Math.min(Math.round((area.puntos_ganados / area.puntos_meta) * 100), 100)
                    : 0;
                return (
                  <div key={area.nombre}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{area.nombre}</span>
                      <span className="text-gray-400">
                        {area.puntos_ganados} / {area.puntos_meta} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: area.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div className="flex flex-col items-center justify-center gap-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-start">
            Progreso Semanal vs Meta
          </h3>
          <p className="text-sm text-gray-600 self-start">
            Total Ganado:{" "}
            <span className="font-bold text-gray-800">
              {totalGanado} / {totalMeta} pts ({porcentaje}%)
            </span>
          </p>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#2563eb"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{porcentaje}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
