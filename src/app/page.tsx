"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { HabitoHoy, RendimientoArea, Area, Habito } from "@/types";
import {
  getDayOfWeek,
  getTodayStr,
  getWeekRange,
  calcularRacha,
} from "@/lib/helpers";
import Header from "@/components/Header";
import DailySummary from "@/components/DailySummary";
import HabitList from "@/components/HabitList";
import WeeklyPerformance from "@/components/WeeklyPerformance";
import NewHabitModal from "@/components/NewHabitModal";

export default function Home() {
  const [habitosHoy, setHabitosHoy] = useState<HabitoHoy[]>([]);
  const [rendimiento, setRendimiento] = useState<RendimientoArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [streak, setStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const dayOfWeek = getDayOfWeek();
    const today = getTodayStr();
    const { start: weekStart, end: weekEnd } = getWeekRange();

    // 1. Áreas
    const { data: areasData } = await supabase.from("areas").select("*");
    setAreas(areasData || []);

    // 2. IDs de hábitos programados para hoy
    const { data: diasHoy } = await supabase
      .from("dias_habito")
      .select("id_habito")
      .eq("num_dia", dayOfWeek);

    const habitoIds = diasHoy?.map((d) => d.id_habito) || [];

    let habitosHoyData: HabitoHoy[] = [];

    if (habitoIds.length > 0) {
      const { data: habitosData } = await supabase
        .from("habitos")
        .select("*, areas(nombre, color)")
        .in("id_habito", habitoIds)
        .eq("estado_activo", true);

      const { data: registrosHoy } = await supabase
        .from("registros_diarios")
        .select("*")
        .eq("fecha", today)
        .in("id_habito", habitoIds);

      habitosHoyData = ((habitosData as Habito[]) || []).map((h) => {
        const registro = registrosHoy?.find((r) => r.id_habito === h.id_habito);
        return {
          id_habito: h.id_habito,
          nombre: h.nombre,
          puntos: h.puntos,
          id_area: h.id_area,
          area_nombre: h.areas?.nombre || "",
          area_color: h.areas?.color || "#6b7280",
          completado: registro?.completado || false,
          id_registro: registro?.id_registro || null,
        };
      });
    }

    setHabitosHoy(habitosHoyData);

    // 3. Rendimiento semanal
    const { data: todosHabitos } = await supabase
      .from("habitos")
      .select("id_habito, id_area, puntos, areas(nombre, color), dias_habito(num_dia)")
      .eq("estado_activo", true);

    const { data: registrosSemana } = await supabase
      .from("registros_diarios")
      .select("id_habito, puntos_obtenidos")
      .gte("fecha", weekStart)
      .lte("fecha", weekEnd)
      .eq("completado", true);

    const metaPorArea: Record<string, { nombre: string; color: string; meta: number }> = {};
    ((todosHabitos as Habito[]) || []).forEach((h) => {
      const areaId = h.id_area;
      if (!metaPorArea[areaId]) {
        metaPorArea[areaId] = {
          nombre: h.areas?.nombre || "",
          color: h.areas?.color || "#6b7280",
          meta: 0,
        };
      }
      metaPorArea[areaId].meta += h.puntos * (h.dias_habito?.length || 0);
    });

    const ganadoPorArea: Record<string, number> = {};
    (registrosSemana || []).forEach((r) => {
      const habito = (todosHabitos as Habito[])?.find((h) => h.id_habito === r.id_habito);
      if (habito) {
        ganadoPorArea[habito.id_area] = (ganadoPorArea[habito.id_area] || 0) + r.puntos_obtenidos;
      }
    });

    const rendimientoData: RendimientoArea[] = Object.entries(metaPorArea).map(([id, data]) => ({
      nombre: data.nombre,
      color: data.color,
      puntos_ganados: ganadoPorArea[id] || 0,
      puntos_meta: data.meta,
    }));

    setRendimiento(rendimientoData);

    // 4. Racha
    const { data: fechasData } = await supabase
      .from("registros_diarios")
      .select("fecha")
      .eq("completado", true)
      .order("fecha", { ascending: false });

    const fechasUnicas = [...new Set((fechasData || []).map((r) => r.fecha as string))];
    setStreak(calcularRacha(fechasUnicas));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (habito: HabitoHoy) => {
    const today = getTodayStr();

    if (habito.id_registro) {
      const nuevoCompletado = !habito.completado;
      await supabase
        .from("registros_diarios")
        .update({
          completado: nuevoCompletado,
          puntos_obtenidos: nuevoCompletado ? habito.puntos : 0,
        })
        .eq("id_registro", habito.id_registro);
    } else {
      await supabase.from("registros_diarios").insert({
        id_habito: habito.id_habito,
        fecha: today,
        completado: true,
        puntos_obtenidos: habito.puntos,
      });
    }

    await fetchData();
  };

  const puntosHoy = habitosHoy.filter((h) => h.completado).reduce((sum, h) => sum + h.puntos, 0);
  const puntosMeta = habitosHoy.reduce((sum, h) => sum + h.puntos, 0);
  const habitosCompletados = habitosHoy.filter((h) => h.completado).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewHabit={() => setShowModal(true)} />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Banner de racha */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center gap-4">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-bold text-lg">¡Hola, Robi!</p>
            <p className="text-blue-100 text-sm">
              {streak > 0
                ? `Racha actual: ${streak} día${streak !== 1 ? "s" : ""} seguido${streak !== 1 ? "s" : ""}`
                : "Completa un hábito hoy para iniciar tu racha"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-300 text-sm">Cargando datos...</div>
        ) : (
          <>
            <DailySummary
              puntosHoy={puntosHoy}
              puntosMeta={puntosMeta}
              habitosCompletados={habitosCompletados}
              habitosTotal={habitosHoy.length}
            />

            <HabitList habitos={habitosHoy} onToggle={handleToggle} />

            <WeeklyPerformance rendimiento={rendimiento} />
          </>
        )}
      </main>

      {showModal && (
        <NewHabitModal
          areas={areas}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
