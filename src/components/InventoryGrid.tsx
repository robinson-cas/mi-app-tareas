"use client";

import type { InventarioItem, SlotCosmetico } from "@/types";
import { obtenerIcono } from "@/lib/iconos";
import { RAREZA_CONFIG } from "@/lib/rareza";

interface InventoryGridProps {
  items: InventarioItem[];
  onEquipar: (item: InventarioItem) => void;
  onDesequipar: (item: InventarioItem) => void;
}

const NOMBRE_SLOT: Record<SlotCosmetico, string> = {
  aura: "Aura",
  cabeza: "Cabeza",
  arma: "Arma",
  espalda: "Espalda",
};

const ORDEN_SLOTS: SlotCosmetico[] = ["aura", "cabeza", "arma", "espalda"];

export default function InventoryGrid({ items, onEquipar, onDesequipar }: InventoryGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-gray-400">Aún no tienes cosméticos.</p>
        <p className="text-gray-300 text-sm mt-1">Consíguelos abriendo cofres o en la Tienda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Inventario
      </h2>

      <div className="space-y-6">
        {ORDEN_SLOTS.map((slot) => {
          const itemsDelSlot = items.filter((i) => i.slot === slot);
          if (itemsDelSlot.length === 0) return null;

          return (
            <div key={slot}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {NOMBRE_SLOT[slot]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {itemsDelSlot.map((item) => {
                  const cosmetico = item.cosmeticos_catalogo;
                  if (!cosmetico) return null;
                  const config = RAREZA_CONFIG[cosmetico.rareza];
                  const Icon = obtenerIcono(cosmetico.icono_lucide);

                  return (
                    <div
                      key={item.id_inventario}
                      className={`rounded-xl border p-3 flex flex-col items-center gap-2 ${config.bg} ${config.border}`}
                    >
                      <Icon size={28} style={{ color: config.color }} />
                      <p className="text-sm font-medium text-gray-800 text-center">{cosmetico.nombre}</p>
                      <span className={`text-[10px] font-bold uppercase ${config.text}`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => (item.equipado ? onDesequipar(item) : onEquipar(item))}
                        className={`w-full text-xs font-medium py-1.5 rounded-lg transition ${
                          item.equipado
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {item.equipado ? "Desequipar" : "Equipar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
