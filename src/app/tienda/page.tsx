"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CanjeCupon, CosmeticoCatalogo, Cupon } from "@/types";
import ShopCosmeticsGrid from "@/components/ShopCosmeticsGrid";
import CouponManager from "@/components/CouponManager";

type Tab = "cosmeticos" | "recompensas";

export default function TiendaPage() {
  const [tab, setTab] = useState<Tab>("cosmeticos");
  const [loading, setLoading] = useState(true);
  const [oro, setOro] = useState(0);
  const [catalogo, setCatalogo] = useState<CosmeticoCatalogo[]>([]);
  const [poseidos, setPoseidos] = useState<string[]>([]);
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [canjes, setCanjes] = useState<CanjeCupon[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: registros } = await supabase.from("registros_diarios").select("oro_ganado").eq("completado", true);
    const oroGanadoRegistros = (registros || []).reduce((s, r) => s + (r.oro_ganado || 0), 0);

    const { data: cofresOro } = await supabase.from("cofres").select("oro_otorgado").eq("recompensa_tipo", "oro");
    const oroDeCofres = (cofresOro || []).reduce((s, c) => s + (c.oro_otorgado || 0), 0);

    const { data: inventario } = await supabase.from("inventario_cosmeticos").select("id_cosmetico, oro_pagado, origen");
    const oroGastadoTienda = (inventario || [])
      .filter((i) => i.origen === "tienda")
      .reduce((s, i) => s + (i.oro_pagado || 0), 0);
    setPoseidos((inventario || []).map((i) => i.id_cosmetico));

    const { data: canjesData } = await supabase
      .from("canjes_cupones")
      .select("*")
      .order("canjeado_en", { ascending: false });
    const oroGastadoCupones = (canjesData || []).reduce((s, c) => s + (c.costo_oro_pagado || 0), 0);
    setCanjes((canjesData as CanjeCupon[]) || []);

    setOro(oroGanadoRegistros + oroDeCofres - oroGastadoTienda - oroGastadoCupones);

    const { data: catalogoData } = await supabase.from("cosmeticos_catalogo").select("*");
    setCatalogo((catalogoData as CosmeticoCatalogo[]) || []);

    const { data: cuponesData } = await supabase
      .from("cupones_catalogo")
      .select("*")
      .eq("activo", true)
      .order("creado_en", { ascending: true });
    setCupones((cuponesData as Cupon[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const comprarCosmetico = async (cosmetico: CosmeticoCatalogo) => {
    if (!cosmetico.precio_oro || oro < cosmetico.precio_oro) return;
    await supabase.from("inventario_cosmeticos").insert({
      id_cosmetico: cosmetico.id_cosmetico,
      slot: cosmetico.slot,
      origen: "tienda",
      oro_pagado: cosmetico.precio_oro,
    });
    await fetchData();
  };

  const crearCupon = async (nombre: string, costoOro: number) => {
    await supabase.from("cupones_catalogo").insert({ nombre, costo_oro: costoOro });
    await fetchData();
  };

  const eliminarCupon = async (id: string) => {
    await supabase.from("cupones_catalogo").delete().eq("id_cupon", id);
    await fetchData();
  };

  const canjearCupon = async (cupon: Cupon) => {
    if (oro < cupon.costo_oro) return;
    await supabase.from("canjes_cupones").insert({
      id_cupon: cupon.id_cupon,
      nombre_cupon_snapshot: cupon.nombre,
      costo_oro_pagado: cupon.costo_oro,
    });
    await fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex-1 max-w-6xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Tienda</p>
          <p className="text-amber-100 text-sm">Gasta tu oro en cosméticos o recompensas reales</p>
        </div>
        <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
          <Coins size={20} />
          <span className="font-bold text-lg">{oro}</span>
        </div>
      </div>

      <div className="flex items-center gap-5 border-b border-gray-200">
        {(["cosmeticos", "recompensas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "cosmeticos" ? "Cosméticos" : "Recompensas Reales"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-300 text-sm">Cargando...</div>
      ) : tab === "cosmeticos" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <ShopCosmeticsGrid catalogo={catalogo} oro={oro} poseidos={poseidos} onComprar={comprarCosmetico} />
        </div>
      ) : (
        <CouponManager
          cupones={cupones}
          canjes={canjes}
          oro={oro}
          onCrear={crearCupon}
          onEliminar={eliminarCupon}
          onCanjear={canjearCupon}
        />
      )}
    </main>
  );
}
