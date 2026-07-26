"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Area } from "@/types";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const COLORES = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

interface NewHabitModalProps {
  areas: Area[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewHabitModal({ areas, onClose, onSuccess }: NewHabitModalProps) {
  const [tab, setTab] = useState<"habito" | "area">("habito");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Habit form state
  const [nombre, setNombre] = useState("");
  const [idArea, setIdArea] = useState(areas[0]?.id_area || "");
  const [puntos, setPuntos] = useState(10);
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([1, 2, 3, 4, 5]);

  // Area form state
  const [areaNombre, setAreaNombre] = useState("");
  const [areaColor, setAreaColor] = useState(COLORES[0]);

  useEffect(() => {
    if (!areas.some((a) => a.id_area === idArea)) {
      setIdArea(areas[0]?.id_area || "");
    }
  }, [areas, idArea]);

  const toggleDia = (dia: number) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const crearHabito = async () => {
    if (!nombre.trim() || !idArea || diasSeleccionados.length === 0) {
      setError("Completa todos los campos y selecciona al menos un día.");
      return;
    }
    setLoading(true);
    setError("");

    const { data: habito, error: err } = await supabase
      .from("habitos")
      .insert({ nombre: nombre.trim(), id_area: idArea, puntos, estado_activo: true })
      .select()
      .single();

    if (err || !habito) {
      setError("Error al crear el hábito.");
      setLoading(false);
      return;
    }

    await supabase
      .from("dias_habito")
      .insert(diasSeleccionados.map((d) => ({ id_habito: habito.id_habito, num_dia: d })));

    setLoading(false);
    onSuccess();
    onClose();
  };

  const crearArea = async () => {
    if (!areaNombre.trim()) {
      setError("Escribe un nombre para el área.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("areas")
      .insert({ nombre: areaNombre.trim(), color: areaColor });

    if (err) {
      setError("Error al crear el área.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    setAreaNombre("");
    setTab("habito");
  };

  const eliminarArea = async (id: string) => {
    if (!confirm("¿Eliminar esta área? También se eliminarán sus hábitos y registros asociados.")) {
      return;
    }
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("areas").delete().eq("id_area", id);

    if (err) {
      setError("Error al eliminar el área.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Tabs */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 border-b border-gray-100">
          <div className="flex gap-5">
            {(["habito", "area"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  tab === t
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "habito" ? "Nuevo Hábito" : "Nueva Área"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 mb-3">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {tab === "habito" ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Nombre del hábito
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Entrenar 45 min"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Área</label>
                {areas.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Primero crea un área en la pestaña &quot;Nueva Área&quot;.
                  </p>
                ) : (
                  <select
                    value={idArea}
                    onChange={(e) => setIdArea(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {areas.map((a) => (
                      <option key={a.id_area} value={a.id_area}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Puntos</label>
                <input
                  type="number"
                  value={puntos}
                  onChange={(e) => setPuntos(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={100}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Días de la semana
                </label>
                <div className="flex gap-1.5">
                  {DIAS.map((dia, i) => {
                    const num = i + 1;
                    const selected = diasSeleccionados.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleDia(num)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={crearHabito}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                {loading ? "Guardando..." : "Crear Hábito"}
              </button>
            </>
          ) : (
            <>
              {areas.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Áreas existentes
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {areas.map((a) => (
                      <div
                        key={a.id_area}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: a.color }}
                          />
                          <span className="text-sm text-gray-700">{a.nombre}</span>
                        </div>
                        <button
                          onClick={() => eliminarArea(a.id_area)}
                          disabled={loading}
                          className="text-gray-300 hover:text-red-500 disabled:opacity-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Nombre del área
                </label>
                <input
                  type="text"
                  value={areaNombre}
                  onChange={(e) => setAreaNombre(e.target.value)}
                  placeholder="Ej: Salud, Trabajo, Finanzas..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAreaColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        areaColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={crearArea}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                {loading ? "Guardando..." : "Crear Área"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
