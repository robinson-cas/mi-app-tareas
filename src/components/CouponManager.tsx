"use client";

import { useState } from "react";
import { Trash2, Coins } from "lucide-react";
import type { CanjeCupon, Cupon } from "@/types";

interface CouponManagerProps {
  cupones: Cupon[];
  canjes: CanjeCupon[];
  oro: number;
  onCrear: (nombre: string, costoOro: number) => void;
  onEliminar: (id: string) => void;
  onCanjear: (cupon: Cupon) => void;
}

export default function CouponManager({ cupones, canjes, oro, onCrear, onEliminar, onCanjear }: CouponManagerProps) {
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState(100);

  const handleCrear = () => {
    if (!nombre.trim() || costo <= 0) return;
    onCrear(nombre.trim(), costo);
    setNombre("");
    setCosto(100);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Crear recompensa real
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Ver una película"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={costo}
            onChange={(e) => setCosto(Math.max(1, Number(e.target.value)))}
            min={1}
            className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
          >
            Crear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Tus recompensas
        </h2>
        {cupones.length === 0 ? (
          <p className="text-gray-300 text-sm">Aún no has creado ninguna recompensa real.</p>
        ) : (
          <div className="space-y-2">
            {cupones.map((cupon) => {
              const noAlcanza = oro < cupon.costo_oro;
              return (
                <div
                  key={cupon.id_cupon}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{cupon.nombre}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Coins size={12} />
                      {cupon.costo_oro}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCanjear(cupon)}
                      disabled={noAlcanza}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      Canjear
                    </button>
                    <button
                      onClick={() => onEliminar(cupon.id_cupon)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canjes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Canjes recientes
          </h2>
          <div className="space-y-1.5">
            {canjes.slice(0, 8).map((canje) => (
              <div key={canje.id_canje} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{canje.nombre_cupon_snapshot}</span>
                <span className="text-gray-400">
                  -{canje.costo_oro_pagado} oro · {new Date(canje.canjeado_en).toLocaleDateString("es-ES")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
