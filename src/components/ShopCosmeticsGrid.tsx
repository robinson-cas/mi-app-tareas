"use client";

import { Coins } from "lucide-react";
import type { CosmeticoCatalogo } from "@/types";
import { obtenerIcono } from "@/lib/iconos";
import { RAREZA_CONFIG } from "@/lib/rareza";

interface ShopCosmeticsGridProps {
  catalogo: CosmeticoCatalogo[];
  oro: number;
  poseidos: string[];
  onComprar: (cosmetico: CosmeticoCatalogo) => void;
}

export default function ShopCosmeticsGrid({ catalogo, oro, poseidos, onComprar }: ShopCosmeticsGridProps) {
  const comprables = catalogo.filter((c) => c.precio_oro !== null);

  if (comprables.length === 0) {
    return <p className="text-gray-300 text-sm">No hay cosméticos disponibles en la tienda por ahora.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {comprables.map((cosmetico) => {
        const config = RAREZA_CONFIG[cosmetico.rareza];
        const Icon = obtenerIcono(cosmetico.icono_lucide);
        const yaTiene = poseidos.includes(cosmetico.id_cosmetico);
        const noAlcanza = !yaTiene && oro < (cosmetico.precio_oro || 0);
        const deshabilitado = yaTiene || noAlcanza;

        return (
          <div
            key={cosmetico.id_cosmetico}
            className={`rounded-xl border p-3 flex flex-col items-center gap-2 ${config.bg} ${config.border} ${
              deshabilitado ? "opacity-60" : ""
            }`}
          >
            <Icon size={28} style={{ color: config.color }} />
            <p className="text-sm font-medium text-gray-800 text-center">{cosmetico.nombre}</p>
            <span className={`text-[10px] font-bold uppercase ${config.text}`}>{config.label}</span>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <Coins size={12} />
              {cosmetico.precio_oro}
            </span>
            <button
              onClick={() => onComprar(cosmetico)}
              disabled={deshabilitado}
              className="w-full text-xs font-medium py-1.5 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {yaTiene ? "Ya lo tienes" : noAlcanza ? "Oro insuficiente" : "Comprar"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
