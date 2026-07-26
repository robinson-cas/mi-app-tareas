"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { HabitoHoy, RendimientoArea, Area, Habito, NivelArea, PerfilJugador } from "@/types";
import {
  getDayOfWeek,
  getTodayStr,
  getWeekRange,
  calcularRacha,
} from "@/lib/helpers";
import {
  rolarRecompensa,
  rolarRarezaCofre,
  calcularNivel,
  calcularNivelGlobal,
  construirNivelesPorArea,
} from "@/lib/gamificacion";
import { useGamificacion } from "@/context/GamificationContext";
import DailySummary from "@/components/DailySummary";
import HabitList from "@/components/HabitList";
import WeeklyPerformance from "@/components/WeeklyPerformance";
import NewHabitModal from "@/components/NewHabitModal";

export default function Home() {
  const [habitosHoy, setHabitosHoy] = useState<HabitoHoy[]>([]);
  const [rendimiento, setRendimiento] = useState<RendimientoArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [streak, setStreak] = useState(0);
  const [perfil, setPerfil] = useState<PerfilJugador>({ nivel_global: 1, oro_balance: 0, pilares: [] });
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<Set<string>>(new Set());

  const { enqueueToast, refreshCofres, nuevoHabitoModalAbierto, cerrarNuevoHabitoModal } =
    useGamificacion();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const dayOfWeek = getDayOfWeek();
    const today = getTodayStr();
    const { start: weekStart, end: weekEnd } = getWeekRange();

    // 1. Áreas
    const { data: areasData } = await supabase.from("areas").select("*");
    setAreas((areasData as Area[]) || []);

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

    type HabitoConMeta = Pick<Habito, "id_habito" | "id_area" | "puntos" | "areas" | "dias_habito">;

    const metaPorArea: Record<string, { nombre: string; color: string; meta: number }> = {};
    ((todosHabitos as unknown as HabitoConMeta[]) || []).forEach((h) => {
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
      const habito = (todosHabitos as unknown as HabitoConMeta[])?.find((h) => h.id_habito === r.id_habito);
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

    // 4. Racha + historial completo (fuente del XP/oro acumulado, no solo esta semana)
    const { data: registrosHistoricos } = await supabase
      .from("registros_diarios")
      .select("id_habito, fecha, puntos_obtenidos, oro_ganado, xp_ganado")
      .eq("completado", true)
      .order("fecha", { ascending: false });

    const fechasUnicas = [...new Set((registrosHistoricos || []).map((r) => r.fecha as string))];
    setStreak(calcularRacha(fechasUnicas));

    // 5. Mapeo histórico habito -> área (incluye hábitos inactivos, el XP pasado no se pierde)
    const { data: habitosHistoricos } = await supabase.from("habitos").select("id_habito, id_area");

    const oroGanadoHistorico = (registrosHistoricos || []).reduce((s, r) => s + (r.oro_ganado || 0), 0);

    const niveles: NivelArea[] = construirNivelesPorArea(
      (areasData as Area[]) || [],
      habitosHistoricos || [],
      registrosHistoricos || []
    );

    // 6. Balance de oro: ganado (hábitos + cofres) menos gastado (tienda + cupones)
    const { data: cofresOro } = await supabase
      .from("cofres")
      .select("oro_otorgado")
      .eq("recompensa_tipo", "oro");
    const oroDeCofres = (cofresOro || []).reduce((s, c) => s + (c.oro_otorgado || 0), 0);

    const { data: comprasTienda } = await supabase
      .from("inventario_cosmeticos")
      .select("oro_pagado")
      .eq("origen", "tienda");
    const oroGastadoTienda = (comprasTienda || []).reduce((s, c) => s + (c.oro_pagado || 0), 0);

    const { data: canjes } = await supabase.from("canjes_cupones").select("costo_oro_pagado");
    const oroGastadoCupones = (canjes || []).reduce((s, c) => s + (c.costo_oro_pagado || 0), 0);

    const oroBalance = oroGanadoHistorico + oroDeCofres - oroGastadoTienda - oroGastadoCupones;

    setPerfil({
      nivel_global: calcularNivelGlobal(niveles.map((n) => n.nivel)),
      oro_balance: oroBalance,
      pilares: niveles,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    refreshCofres();
  }, [refreshCofres]);

  const handleToggle = async (habito: HabitoHoy) => {
    setProcesando((prev) => new Set(prev).add(habito.id_habito));

    try {
      const today = getTodayStr();
      const completingNow = !habito.completado;

      if (completingNow) {
        const { oro, xp } = rolarRecompensa();

        const { data: habitosDelArea } = await supabase
          .from("habitos")
          .select("id_habito")
          .eq("id_area", habito.id_area);
        const idsHabitosArea = (habitosDelArea || []).map((h) => h.id_habito);

        let xpAntes = 0;
        if (idsHabitosArea.length > 0) {
          const { data: registrosArea } = await supabase
            .from("registros_diarios")
            .select("xp_ganado")
            .in("id_habito", idsHabitosArea)
            .eq("completado", true);
          xpAntes = (registrosArea || []).reduce((s, r) => s + (r.xp_ganado || 0), 0);
        }
        const nivelAntes = calcularNivel(xpAntes).nivel;

        await supabase.from("registros_diarios").upsert(
          {
            id_habito: habito.id_habito,
            fecha: today,
            completado: true,
            puntos_obtenidos: habito.puntos,
            oro_ganado: oro,
            xp_ganado: xp,
          },
          { onConflict: "id_habito,fecha" }
        );

        enqueueToast({ tipo: "recompensa", xp, oro, color: habito.area_color });

        const nivelDespues = calcularNivel(xpAntes + xp).nivel;

        if (nivelDespues > nivelAntes) {
          const { error } = await supabase.from("cofres").insert({
            origen: "nivel",
            id_area: habito.id_area,
            nivel_alcanzado: nivelDespues,
            rareza: rolarRarezaCofre(),
          });
          if (!error) {
            enqueueToast({
              tipo: "subida_nivel",
              pilar: habito.area_nombre,
              nivel: nivelDespues,
              color: habito.area_color,
            });
          } else if (error.code !== "23505") {
            console.error("Error al crear cofre de nivel:", error);
          }
        }

        const todosCompletos = habitosHoy.every((h) =>
          h.id_habito === habito.id_habito ? true : h.completado
        );

        if (todosCompletos) {
          const { error } = await supabase.from("cofres").insert({
            origen: "dia_completo",
            fecha: today,
            rareza: rolarRarezaCofre(),
          });
          if (!error) {
            enqueueToast({ tipo: "cofre" });
          } else if (error.code !== "23505") {
            console.error("Error al crear cofre de día completo:", error);
          }
        }
      } else {
        await supabase.from("registros_diarios").upsert(
          {
            id_habito: habito.id_habito,
            fecha: today,
            completado: false,
            puntos_obtenidos: 0,
            oro_ganado: 0,
            xp_ganado: 0,
          },
          { onConflict: "id_habito,fecha" }
        );
      }

      await fetchData();
      await refreshCofres();
    } finally {
      setProcesando((prev) => {
        const next = new Set(prev);
        next.delete(habito.id_habito);
        return next;
      });
    }
  };

  const puntosHoy = habitosHoy.filter((h) => h.completado).reduce((sum, h) => sum + h.puntos, 0);
  const puntosMeta = habitosHoy.reduce((sum, h) => sum + h.puntos, 0);
  const habitosCompletados = habitosHoy.filter((h) => h.completado).length;

  return (
    <div className="min-h-screen bg-gray-50 flex-1">
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Banner de racha + nivel global */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
          <div className="text-right shrink-0">
            <p className="text-xs uppercase tracking-widest text-blue-100">Nivel {perfil.nivel_global}</p>
            <p className="font-bold">{perfil.oro_balance} 🪙</p>
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

            <HabitList habitos={habitosHoy} onToggle={handleToggle} procesandoIds={procesando} />

            <WeeklyPerformance rendimiento={rendimiento} />
          </>
        )}
      </main>

      {nuevoHabitoModalAbierto && (
        <NewHabitModal areas={areas} onClose={cerrarNuevoHabitoModal} onSuccess={fetchData} />
      )}
    </div>
  );
}
