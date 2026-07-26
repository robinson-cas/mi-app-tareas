"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trash2, Plus } from "lucide-react";

interface Tarea {
  id: number;
  texto: string;
  completada: boolean;
}

export default function Home() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // Cargar tareas guardadas
  useEffect(() => {
    const guardadas = localStorage.getItem("mis_tareas");
    if (guardadas) setTareas(JSON.parse(guardadas));
  }, []);

  // Guardar tareas al cambiar
  useEffect(() => {
    localStorage.setItem("mis_tareas", JSON.stringify(tareas));
  }, [tareas]);

  const agregarTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;
    setTareas([...tareas, { id: Date.now(), texto: nuevaTarea, completada: false }]);
    setNuevaTarea("");
  };

  const alternarTarea = (id: number) => {
    setTareas(
      tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  };

  const eliminarTarea = (id: number) => {
    setTareas(tareas.filter((t) => t.id !== id));
  };

  // Cálculo del progreso
  const total = tareas.length;
  const completadas = tareas.filter((t) => t.completada).length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100 font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Tareas Diarias</h1>

      {/* Barra / Gráfico de Progreso */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progreso diario</span>
          <span className="text-sm font-bold text-blue-600">{porcentaje}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completadas} de {total} tareas completadas
        </p>
      </div>

      {/* Formulario de Nueva Tarea */}
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Escribe una tarea..."
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center transition"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* Lista de Tareas */}
      <ul className="space-y-2">
        {tareas.map((tarea) => (
          <li
            key={tarea.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <button
              onClick={() => alternarTarea(tarea.id)}
              className="flex items-center gap-3 text-left flex-1"
            >
              {tarea.completada ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-400" size={20} />
              )}
              <span
                className={
                  tarea.completada
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                }
              >
                {tarea.texto}
              </span>
            </button>
            <button
              onClick={() => eliminarTarea(tarea.id)}
              className="text-gray-400 hover:text-red-500 p-1 transition"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
