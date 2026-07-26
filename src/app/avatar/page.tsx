"use client";

import { useCallback, useEffect, useState } from "react";
import { Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Area, Cofre, CosmeticoCatalogo, InventarioItem, NivelArea, SlotCosmetico } from "@/types";
import { construirNivelesPorArea, calcularNivelGlobal, elegirCosmeticoParaCofre, type ResultadoCofre } from "@/lib/gamificacion";
import { useGamificacion } from "@/context/GamificationContext";
import AvatarFigure from "@/components/AvatarFigure";
import StatsPanel from "@/components/StatsPanel";
import InventoryGrid from "@/components/InventoryGrid";
import ChestOpenModal from "@/components/ChestOpenModal";

export default function AvatarPage() {
  const [niveles, setNiveles] = useState<NivelArea[]>([]);
  const [nivelGlobal, setNivelGlobal] = useState(1);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [catalogo, setCatalogo] = useState<CosmeticoCatalogo[]>([]);
  const [cofresPendientes, setCofresPendientes] = useState<Cofre[]>([]);
  const [cofreAbriendo, setCofreAbriendo] = useState<Cofre | null>(null);
  const [loading, setLoading] = useState(true);

  const { refreshCofres } = useGamificacion();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: areasData } = await supabase.from("areas").select("*");
    const { data: habitosHistoricos } = await supabase.from("habitos").select("id_habito, id_area");
    const { data: registrosHistoricos } = await supabase
      .from("registros_diarios")
      .select("id_habito, xp_ganado")
      .eq("completado", true);

    const nivelesData = construirNivelesPorArea(
      (areasData as Area[]) || [],
      habitosHistoricos || [],
      registrosHistoricos || []
    );
    setNiveles(nivelesData);
    setNivelGlobal(calcularNivelGlobal(nivelesData.map((n) => n.nivel)));

    const { data: inventarioData } = await supabase
      .from("inventario_cosmeticos")
      .select("*, cosmeticos_catalogo(*)")
      .order("obtenido_en", { ascending: false });
    setInventario((inventarioData as unknown as InventarioItem[]) || []);

    const { data: catalogoData } = await supabase.from("cosmeticos_catalogo").select("*");
    setCatalogo((catalogoData as CosmeticoCatalogo[]) || []);

    const { data: cofresData } = await supabase
      .from("cofres")
      .select("*")
      .eq("reclamado", false)
      .order("creado_en", { ascending: true });
    setCofresPendientes((cofresData as Cofre[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    refreshCofres();
  }, [fetchData, refreshCofres]);

  const equipar = async (item: InventarioItem) => {
    await supabase
      .from("inventario_cosmeticos")
      .update({ equipado: false })
      .eq("slot", item.slot)
      .eq("equipado", true);
    await supabase.from("inventario_cosmeticos").update({ equipado: true }).eq("id_inventario", item.id_inventario);
    await fetchData();
  };

  const desequipar = async (item: InventarioItem) => {
    await supabase.from("inventario_cosmeticos").update({ equipado: false }).eq("id_inventario", item.id_inventario);
    await fetchData();
  };

  const abrirCofre = async (cofre: Cofre): Promise<ResultadoCofre> => {
    const { data: poseidosData } = await supabase.from("inventario_cosmeticos").select("id_cosmetico");
    const poseidos = new Set((poseidosData || []).map((i) => i.id_cosmetico));

    const resultado = elegirCosmeticoParaCofre(cofre.rareza, catalogo, poseidos);

    if (resultado.tipo === "cosmetico") {
      await supabase.from("inventario_cosmeticos").insert({
        id_cosmetico: resultado.cosmetico.id_cosmetico,
        slot: resultado.cosmetico.slot,
        origen: "cofre",
      });
    }

    await supabase
      .from("cofres")
      .update({
        reclamado: true,
        abierto_en: new Date().toISOString(),
        recompensa_tipo: resultado.tipo,
        id_cosmetico_otorgado: resultado.tipo === "cosmetico" ? resultado.cosmetico.id_cosmetico : null,
        oro_otorgado: resultado.tipo === "oro" ? resultado.cantidad : null,
      })
      .eq("id_cofre", cofre.id_cofre);

    return resultado;
  };

  const equipados: Partial<Record<SlotCosmetico, CosmeticoCatalogo>> = {};
  inventario
    .filter((i) => i.equipado && i.cosmeticos_catalogo)
    .forEach((i) => {
      equipados[i.slot] = i.cosmeticos_catalogo;
    });

  return (
    <main className="min-h-screen bg-gray-50 flex-1 max-w-6xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-2xl px-6 py-3 shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-blue-100 font-semibold">Nivel</span>
          <span className="text-4xl font-extrabold leading-tight">{nivelGlobal}</span>
        </div>
        <div>
          <p className="font-bold text-lg">Tu Avatar</p>
          <p className="text-blue-100 text-sm">Nivel de personaje: promedio de tus 4 pilares</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-300 text-sm">Cargando...</div>
      ) : (
        <>
          {cofresPendientes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Cofres pendientes
              </h2>
              <div className="flex flex-wrap gap-3">
                {cofresPendientes.map((cofre) => (
                  <button
                    key={cofre.id_cofre}
                    onClick={() => setCofreAbriendo(cofre)}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-100 transition w-32"
                  >
                    <Package size={40} className="text-gray-400 animate-pulse" strokeWidth={1.5} />
                    <span className="text-xs text-gray-500">Toca para abrir</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center md:w-72 shrink-0">
              <AvatarFigure equipados={equipados} />
            </div>
            <StatsPanel niveles={niveles} />
          </div>

          <InventoryGrid items={inventario} onEquipar={equipar} onDesequipar={desequipar} />
        </>
      )}

      {cofreAbriendo && (
        <ChestOpenModal
          cofre={cofreAbriendo}
          onAbrir={() => abrirCofre(cofreAbriendo)}
          onClose={async () => {
            setCofreAbriendo(null);
            await fetchData();
            await refreshCofres();
          }}
        />
      )}
    </main>
  );
}
