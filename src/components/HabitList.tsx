"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { HabitoHoy } from "@/types";

interface HabitListProps {
  habitos: HabitoHoy[];
  onToggle: (habito: HabitoHoy) => void;
  procesandoIds?: Set<string>;
}

export default function HabitList({ habitos, onToggle, procesandoIds }: HabitListProps) {
  const diaHoy = new Date().toLocaleDateString("es-ES", { weekday: "long" });

  if (habitos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-gray-400">No hay hábitos programados para hoy.</p>
        <p className="text-gray-300 text-sm mt-1">Crea un hábito y asígnalo a este día.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">
          📌 Hábitos de Hoy{" "}
          <span className="text-gray-400 font-normal capitalize">({diaHoy})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 w-10"></th>
              <th className="text-left px-4 py-3">Hábito</th>
              <th className="text-left px-4 py-3">Área</th>
              <th className="text-left px-4 py-3">Puntos</th>
              <th className="text-left px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {habitos.map((habito) => (
              <tr
                key={habito.id_habito}
                className={`hover:bg-gray-50 transition ${habito.completado ? "opacity-60" : ""}`}
              >
                <td className="px-5 py-4">
                  {habito.completado ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <Circle className="text-gray-300" size={20} />
                  )}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`font-medium ${
                      habito.completado ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {habito.nombre}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: habito.area_color }}
                  >
                    {habito.area_nombre}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-blue-600">+{habito.puntos} pts</span>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onToggle(habito)}
                    disabled={procesandoIds?.has(habito.id_habito)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-wait ${
                      habito.completado
                        ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {habito.completado ? "Completado ✓" : "Marcar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
