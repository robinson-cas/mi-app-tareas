"use client";

import { useState } from "react";
import { Package, PackageOpen, Sparkles, Coins } from "lucide-react";
import type { Cofre } from "@/types";
import type { ResultadoCofre } from "@/lib/gamificacion";
import { obtenerIcono } from "@/lib/iconos";
import { RAREZA_CONFIG } from "@/lib/rareza";

interface ChestOpenModalProps {
  cofre: Cofre;
  onAbrir: () => Promise<ResultadoCofre>;
  onClose: () => void;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Estado = "sellado" | "abriendo" | "revelado";

export default function ChestOpenModal({ cofre, onAbrir, onClose }: ChestOpenModalProps) {
  const [estado, setEstado] = useState<Estado>("sellado");
  const [resultado, setResultado] = useState<ResultadoCofre | null>(null);

  const config = RAREZA_CONFIG[cofre.rareza];

  const handleAbrir = async () => {
    setEstado("abriendo");
    const [res] = await Promise.all([onAbrir(), delay(900)]);
    setResultado(res);
    setEstado("revelado");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transition-colors ${
          estado === "revelado" ? `bg-gradient-to-b ${config.bg} to-white` : "bg-white"
        }`}
      >
        {estado === "sellado" && (
          <>
            <Package size={96} className="text-gray-400 mx-auto" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-gray-800 mt-4">Cofre Misterioso</h2>
            <p className="text-sm text-gray-400 mt-1">No sabrás qué hay dentro hasta abrirlo.</p>
            <button
              onClick={handleAbrir}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
            >
              Abrir Cofre
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full text-gray-400 hover:text-gray-600 text-sm py-2"
            >
              Más tarde
            </button>
          </>
        )}

        {estado === "abriendo" && (
          <div className="relative py-4">
            <div
              className="absolute inset-0 mx-auto w-32 h-32 rounded-full blur-xl opacity-60 transition-colors duration-700"
              style={{ backgroundColor: config.color }}
            />
            <PackageOpen
              size={96}
              className="text-gray-500 mx-auto relative z-10 animate-bounce"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-400 mt-4 relative z-10">Abriendo...</p>
          </div>
        )}

        {estado === "revelado" && resultado && (
          <>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${config.border} ${config.text}`}
            >
              {config.label}
            </span>

            <div className="relative w-24 h-24 mx-auto mt-5">
              <Sparkles
                size={96}
                className="absolute inset-0 text-white animate-ping opacity-75"
                style={{ color: config.color }}
              />
              <div
                className={`relative w-24 h-24 rounded-full ring-4 ${config.ring} bg-white flex items-center justify-center ${
                  cofre.rareza === "legendario" ? "animate-pulse" : ""
                }`}
              >
                {resultado.tipo === "cosmetico" ? (
                  (() => {
                    const Icon = obtenerIcono(resultado.cosmetico.icono_lucide);
                    return <Icon size={40} style={{ color: config.color }} />;
                  })()
                ) : (
                  <Coins size={40} className="text-amber-500" />
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mt-4">
              {resultado.tipo === "cosmetico" ? resultado.cosmetico.nombre : `+${resultado.cantidad} Oro`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {resultado.tipo === "cosmetico"
                ? "¡Se añadió a tu inventario!"
                : "Ya tenías todos los cosméticos de esta rareza."}
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
            >
              Genial
            </button>
          </>
        )}
      </div>
    </div>
  );
}
